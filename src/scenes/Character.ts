import { sceneEventConstants } from './sceneEvents';
import { Controlls } from "./BaseControlls";
import { NavMeshPoint } from '~/levelComponents/NavMesh';
import { CharacterState } from './characterStates/CharacterState';
import { ButcherAttackState } from './characterStates/ButcherAttackState';
import { CharacterWithGoToScheduledPointState } from './characterStates/CharacterWithGoToScheduledPointState';

class CharacterWithControllerState extends CharacterState {
    update(delta: number) {
        this.character.controller?.update(delta);
        this.character.updatePositionAndDirectionBasedOnSpeed(delta)
    }
}

export class Character {
    sprite: Phaser.Physics.Matter.Sprite;
    textBubble: Phaser.GameObjects.Text;
    lastDirection: Phaser.Types.Math.Vector2Like = { x: 0, y: 0 };
    myLight: Phaser.GameObjects.Light;
    imageFramePrefix: string;
    defaultAnimation: string;
    moveAnim: string;

    isDead = false;
    controller?: Controlls;
    shadow: Phaser.GameObjects.Ellipse;

    currentState: CharacterState;
    // list of states that can take place in currentState above
    followPathState!: CharacterWithGoToScheduledPointState;
    attackState!: ButcherAttackState;

    id: string = "";
    lastDirectionAnimationFrame!: string;

    running = false;

    // TODO - add id to sprite, for getting by id for scripts
    constructor(scene: Phaser.Scene, x: number, y: number, imageFrame: string, imageFramePrefix: string) {

        this.currentState = new CharacterWithControllerState(this);
        this.imageFramePrefix = imageFramePrefix;
        this.sprite = scene.matter.add.sprite(x, y, imageFramePrefix + imageFrame);

        this.sprite.play({ key: imageFramePrefix + imageFrame, repeat: -1 });
        this.sprite.setCircle(17, {
            label: imageFramePrefix, collisionFilter: {
                category: 1,
                mask: 1
            }
        })
            .setScale(0.9)
            .setFixedRotation()
            .setOrigin(0.5, 0.9)
            .setPipeline('Light2D');

        this.textBubble = scene.add.text(10, 10, "");
        this.textBubble.setBackgroundColor("#000000");
        this.textBubble.setAlign('center');
        this.textBubble.setMaxLines(2);

        this.shadow = scene.add.ellipse(x, y, 30, 15, 0x111111, 0.3);
        this.shadow.setSmoothness(8);


        this.myLight = scene.lights.addLight(
            x,
            y,
            100
        ).setColor(0xffffff)
            .setIntensity(1.0);


        // this.textBubble.setText("Bodies everywhere!");
        this.defaultAnimation = 'idle';
        this.moveAnim = 'walk';

        this.sprite.on('damage', this.onDamage, this)
    }

    setAutoPathFollowSchedule(autoPathFollowSchedule: NavMeshPoint[]) {
        if (!this.followPathState) {
            this.followPathState = new CharacterWithGoToScheduledPointState(this);

            this.followPathState.setWalkingSchedule(autoPathFollowSchedule);
        }

        if (!(this.currentState instanceof CharacterWithGoToScheduledPointState)) {
            this.currentState.destroy();

            this.followPathState.start();

        } else {
            this.followPathState.setAutoFollowPathPoints(autoPathFollowSchedule);
        }

        this.currentState = this.followPathState;
    }

    setAttackSchedule() {
        if (!this.attackState) {
            this.attackState = new ButcherAttackState(this);
        }


        if (!(this.currentState instanceof ButcherAttackState)) {
            this.currentState.destroy();

        }

        this.currentState = this.attackState
        this.sprite.scene.time.addEvent({
            delay: 100,
            callback: () => {
                this.attackState.start();
            }, callbackScope: this
        })
    }

    bark(text: string = "") {
        if (this.isDead) return;

        this.textBubble.setText(text);

        if (!text) return;

        // clear text bubble
        this.sprite.scene.time.delayedCall(2500, () => {
            this.textBubble.setText("");
        });
    }

    onDamage(value: number) {
        if (this.isDead) return;

        this.isDead = true;
        // console.log("OOOOUCH", value);

        const deathAnim = 'playerdeath-S.png'
        if (this.sprite.texture.key !== deathAnim) {
            this.sprite.setTexture(deathAnim);
            this.sprite.play({ key: deathAnim });

            this.sprite.scene.events.emit(sceneEventConstants.characterDeath, this, 'damage');
        }
    }

    onMadeInsane() {
        if (this.isDead) return;

        this.isDead = true;
        const deathAnim = 'playerdeath-S.png'

        if (this.sprite.texture.key !== deathAnim) {
            this.sprite.setTexture(deathAnim);
            this.sprite.play({ key: deathAnim });

            this.sprite.scene.events.emit(sceneEventConstants.characterDeath, this, 'insane');
        }
    }

    animationDirectionFromSpeed(): string {
        const y = this.lastDirection.y ?? 0;
        const xAnimFrame = this.lastDirection.x !== 0 ? 'E' : '';
        const yAnimFrame = y > 0 ? 'S' : (y < 0 ? 'N' : '');
        const animDirectionFrameBase = `${yAnimFrame}${xAnimFrame}`;
        const animDirectionFrame = animDirectionFrameBase !== '' ? `-${animDirectionFrameBase}.png` : '-S.png';
        this.lastDirectionAnimationFrame = animDirectionFrame;
        return animDirectionFrame;
    }

    updatePositionAndDirectionBasedOnSpeed(delta: number) {
        this.sprite.setDepth(this.sprite.y);

        // this.currentState.update(delta);

        this.shadow.x = this.sprite.x;
        this.shadow.y = this.sprite.y - 5;
        this.shadow.setDepth(this.sprite.y - 10);

        if (this.isDead) {
            return;
        }

        const playerVelocity = this.sprite.getVelocity();

        this.animationDirectionFromSpeed();

        if (playerVelocity.x !== 0 || playerVelocity.y !== 0) {
            this.lastDirection = playerVelocity;

            this.sprite.flipX = (this.lastDirection.x ?? 0) < 0;
            this.playAnimationFrameOnLastDirection(this.moveAnim);
        }
        else {
            const moveAnim = this.defaultAnimation;
            this.playAnimationFrameOnLastDirection(moveAnim);
        }

        this.textBubble.setPosition(this.sprite.x, this.sprite.y);
        this.textBubble.setDepth(this.sprite.depth + 10000);

        this.myLight.x = this.sprite.x;

        this.myLight.y = this.sprite.y - 50;
    }

    playAnimationFrameOnLastDirection(name: string, repeat = -1) {
        const animFrame = `${this.imageFramePrefix}${name}${this.lastDirectionAnimationFrame}`;
        this.playAnimationFrame(animFrame, repeat);
    }

    playAnimationFrame(name: string, repeat = -1) {
        if (this.sprite.texture.key !== name) {
            // console.log('>>>>>>', name);
            this.sprite.setTexture(name);
            this.sprite.play({ key: name, repeat: repeat });
        }
    }
}


