import { GameDialogue } from './GameDialogue';
import { sceneEventConstants } from './sceneEvents';
import { Controlls } from './Controlls';

class CharacterState {
    character: Character;
    constructor(character: Character) {
        this.character = character;
    }

    update(_delta: number) {
    }
}

class CharacterWithControllerState extends CharacterState {
    update(delta: number) {
        this.character.controller?.update(delta);
    }
}

class CharacterWithGoToScheduledPointState extends CharacterState {
    ids: string[] = [];
    currentPointIndex = -1;

    constructor(character: Character) {
        super(character);

        this.character.sprite.on(sceneEventConstants.arrivedAtObjectPoint, this.pickNextPoint, this);
    }

    pickNextPoint() {
        if (!this.ids.length) {
            return;
        }

        this.currentPointIndex += 1;
        if (this.currentPointIndex >= this.ids.length) {
            // Todo: add if neeed to loop
            // Todo: if no loop, notify parent

            this.currentPointIndex = 0;
        }
        const idToFollow = this.ids[this.currentPointIndex];

        this.character.sprite.scene.events.emit(sceneEventConstants.requestObjectPointFollow, this.character, idToFollow);

    }

    setIds(ids: string[]) {
        this.ids = ids ?? [];
        this.currentPointIndex = -1;
    }

    update(delta: number) {
        if (this.currentPointIndex === -1) {
            this.pickNextPoint();
        }
        this.character.controller?.update(delta);
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

    // TODO - add id to sprite, for getting by id for scripts
    constructor(scene: Phaser.Scene, x: number, y: number, imageFrame: string, imageFramePrefix: string) {

        this.currentState = new CharacterWithControllerState(this);
        this.imageFramePrefix = imageFramePrefix;
        this.sprite = scene.matter.add.sprite(x, y, imageFramePrefix + imageFrame);

        this.sprite.play({ key: imageFramePrefix + imageFrame, repeat: -1 });
        this.sprite.setCircle(17, { label: imageFramePrefix })
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
            .setIntensity(1.5);


        // this.textBubble.setText("Bodies everywhere!");
        this.defaultAnimation = 'idle';
        this.moveAnim = 'run';

        this.sprite.on('damage', this.onDamage, this)
    }

    setAutoPathFollowSchedule(autoPathFollowSchedule: GameDialogue['schedule']) {
        if (!autoPathFollowSchedule?.ids?.length) {
            return;
        }

        const followPointState = new CharacterWithGoToScheduledPointState(this);
        followPointState.setIds(autoPathFollowSchedule.ids);

        this.currentState = followPointState;
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
        console.log("OOOOUCH", value);

        const deathAnim = 'playerdeath-S.png'
        if (this.sprite.texture.key !== deathAnim) {
            this.sprite.setTexture(deathAnim);
            this.sprite.play({ key: deathAnim });

            this.sprite.scene.events.emit('characterDeath', this);
        }
    }

    animationDirectionFromSpeed(): string {
        const y = this.lastDirection.y ?? 0;
        const xAnimFrame = this.lastDirection.x !== 0 ? 'E' : '';
        const yAnimFrame = y > 0 ? 'S' : (y < 0 ? 'N' : '');
        const animDirectionFrameBase = `${yAnimFrame}${xAnimFrame}`;
        const animDirectionFrame = animDirectionFrameBase !== '' ? `-${animDirectionFrameBase}.png` : '-S.png';
        return animDirectionFrame;
    }

    update(delta: number) {
        this.sprite.setDepth(this.sprite.y);

        this.currentState.update(delta);

        this.shadow.x = this.sprite.x;
        this.shadow.y = this.sprite.y - 5;
        this.shadow.setDepth(this.sprite.y - 10);

        if (this.isDead) {
            return;
        }

        const playerVelocity = this.sprite.getVelocity();

        const animDirectionFrame = this.animationDirectionFromSpeed();

        if (playerVelocity.x !== 0 || playerVelocity.y !== 0) {
            this.lastDirection = playerVelocity;
            const walkAnimFrame = `${this.imageFramePrefix}${this.moveAnim}${animDirectionFrame}`;

            this.sprite.flipX = (this.lastDirection.x ?? 0) < 0;
            this.playAnimationFrame(walkAnimFrame);
        }
        else {
            const moveAnim = this.defaultAnimation;
            const idleAnimFrame = `${this.imageFramePrefix}${moveAnim}${animDirectionFrame}`;
            // console.log('>>>>>>', idleAnimFrame);
            this.playAnimationFrame(idleAnimFrame);

        }

        this.textBubble.setPosition(this.sprite.x, this.sprite.y);
        this.textBubble.setDepth(this.sprite.depth + 10000);

        this.myLight.x = this.sprite.x;

        this.myLight.y = this.sprite.y - 50;



    }

    playAnimationFrame(name: string) {
        if (this.sprite.texture.key !== name) {
            this.sprite.setTexture(name);
            this.sprite.play({ key: name, repeat: -1 });
        }
    }
}


