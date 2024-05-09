import { GameDialogue } from './GameDialogue';
import { sceneEventConstants } from './sceneEvents';
import { Controlls } from './Controlls';
import { NavMeshPoint } from '~/levelComponents/NavMesh';
import { GameSceneTopPossibilities } from './GameSceneTopInterface';
import { Animations } from 'phaser';

class CharacterState {
    character: Character;
    constructor(character: Character) {
        this.character = character;
    }

    start() {
    }

    update(_delta: number) {
    }

    destroy() {
    }
}

class CharacterWithControllerState extends CharacterState {
    update(delta: number) {
        this.character.controller?.update(delta);
        this.character.updatePositionAndDirectionBasedOnSpeed(delta)
    }
}


class ButcherAttackState extends CharacterState {

    pathGraphicsDebugInfo: Phaser.GameObjects.Graphics | null = null;
    start() {
        // console.log("look at me, I am attacking");

        if (this.character.sprite.scene.matter.world.drawDebug) {
            this.pathGraphicsDebugInfo = this.character.sprite.scene.add.graphics({ lineStyle: { color: 0x00ff00 } });
        }

        this.character.bark("kill");
        this.character.playAnimationFrameOnLastDirection('slice', 0);
        this.character.sprite.once(Animations.Events.ANIMATION_COMPLETE, () => {
            // console.log('time to walk again');
            this.character.setAutoPathFollowSchedule([]);

            this.pathGraphicsDebugInfo?.destroy();
            this.pathGraphicsDebugInfo = null;
        });

        const { x, y } = this.character.sprite;
        const normalizedDirection = new Phaser.Math.Vector2(this.character.lastDirection)
            .normalize()
            .scale(30);

        const diameter = 30;
        const rX = x + normalizedDirection.x - diameter;
        const rY = y + normalizedDirection.y - diameter;

        const bodies = this.character.sprite.scene.matter.intersectRect(
            rX, rY,
            diameter * 2, diameter * 2
        ).filter((b) => {
            // @ts-ignore
            return !b.isStatic && b.label === 'player'
        })

        if (bodies.length > 0) {
            const playerBody = bodies[0];

            // @ts-ignore
            playerBody.gameObject.emit('damage', 100)

            this.character.followPathState.setEnemyFollowId(null);

        }

        if (this.character.sprite.scene.matter.world.drawDebug) {
            this.pathGraphicsDebugInfo?.strokeRect(rX, rY, diameter * 2, diameter * 2);
            this.pathGraphicsDebugInfo?.setDepth(this.pathGraphicsDebugInfo.y + 100);
        }
    }

    destroy() {
        this.pathGraphicsDebugInfo?.destroy();
        this.pathGraphicsDebugInfo = null;
    }

    update() {

        this.character.sprite.setVelocity(0);
    }
}

export class CharacterWithGoToScheduledPointState extends CharacterState {
    autoFollowPathPoints: NavMeshPoint[] = [];
    currentPointIndex = -1;

    fetchFollowPathEvent: Phaser.Time.TimerEvent;
    pathGraphicsDebugInfo: Phaser.GameObjects.Graphics | null = null;

    followingCharacter: string | null = null

    schedulePoints: {
        originalScheduleForWalking: NavMeshPoint[],
        currentIndex: number
    } = {
            originalScheduleForWalking: [],
            currentIndex: -1
        }
    nextPoint!: NavMeshPoint;

    start() {
        this.character.sprite.on(sceneEventConstants.arrivedAtObjectPoint, this.pickNextPoint, this);
        this.character.sprite.on(sceneEventConstants.foundEnemyId, this.setEnemyFollowId, this);

        // todo move to separate function to be able to remove from events when state is removed
        this.fetchFollowPathEvent = new Phaser.Time.TimerEvent({
            delay: 901,
            loop: true,
            callback: () => {
                const scene = this.character.sprite.scene as unknown as GameSceneTopPossibilities;
                const newPath = scene.onRequestCharacterFollowPath(this.character.sprite, {
                    characterId: this.followingCharacter,
                    point: this.nextPoint,
                });


                this.setAutoFollowPathPoints(newPath);
            },
            callbackScope: this
        });
        this.character.sprite.scene.time.addEvent(this.fetchFollowPathEvent);


        if (this.character.sprite.scene.matter.world.drawDebug) {
            this.pathGraphicsDebugInfo = this.character.sprite.scene.add.graphics({ lineStyle: { color: 0x00ff00 } });
        }
    }

    setEnemyFollowId(id: string | null) {
        this.followingCharacter = id;
    }

    updatePathDebugInfo() {

        if (!this.character.sprite.scene.matter.world.drawDebug) {
            return
        }

        if (!this.pathGraphicsDebugInfo) {
            return
        }

        const toDrawPAth = this.autoFollowPathPoints;
        let maxDepth = 0;

        this.pathGraphicsDebugInfo.clear();
        if (toDrawPAth) {
            let lastPoint: NavMeshPoint | null = null;

            for (const p of toDrawPAth) {
                if (lastPoint) {
                    const l = new Phaser.Geom.Line(lastPoint.x, lastPoint.y, p.x, p.y);
                    this.pathGraphicsDebugInfo.strokeLineShape(l);
                }

                lastPoint = p;

                maxDepth = Math.max(maxDepth, p.y)
            }

        }

        this.pathGraphicsDebugInfo.setDepth(maxDepth * 10);
    }

    destroy() {
        this.character.sprite.off(sceneEventConstants.arrivedAtObjectPoint, this.pickNextPoint)
        this.character.sprite.off(sceneEventConstants.foundEnemyId, this.setEnemyFollowId);
        this.character.sprite.scene.time.removeEvent(this.fetchFollowPathEvent)

        if (this.pathGraphicsDebugInfo) {
            this.pathGraphicsDebugInfo.destroy()
        }
    }

    pickNextPoint() {
        this.currentPointIndex += 1;
        if (this.currentPointIndex >= this.autoFollowPathPoints.length) {
            // Todo: add if neeed to loop
            // Todo: if no loop, notify parent
            // console.log("-----> reached end");
            if (this.followingCharacter) {
                this.character.setAttackSchedule();
            } else {
                this.schedulePoints.currentIndex += 1;
                if (this.schedulePoints.currentIndex >= this.schedulePoints.originalScheduleForWalking.length) {
                    this.schedulePoints.currentIndex = 0;
                }
                this.nextPoint = this.schedulePoints.originalScheduleForWalking[this.schedulePoints.currentIndex];
            }
        } else {
            const point = this.autoFollowPathPoints[this.currentPointIndex];
            this.character.sprite.emit(sceneEventConstants.chase, true, point.x, point.y);
        }
    }


    setWalkingSchedule(ids: NavMeshPoint[]) {
        this.schedulePoints.originalScheduleForWalking = ids ?? [];
        this.schedulePoints.currentIndex = -1;
        if (this.schedulePoints.originalScheduleForWalking.length > 0) {
            this.schedulePoints.currentIndex = -1;
            this.nextPoint = this.schedulePoints.originalScheduleForWalking[0]
        }
        this.updatePathDebugInfo();

        this.setAutoFollowPathPoints(ids);
    }

    setAutoFollowPathPoints(ids: NavMeshPoint[] = []) {
        this.autoFollowPathPoints = ids;

        if (this.autoFollowPathPoints.length > 0) {
            this.autoFollowPathPoints[0] = {
                x: this.character.sprite.x,
                y: this.character.sprite.y
            }
        }
        this.currentPointIndex = -1;

        this.updatePathDebugInfo();
    }

    update(delta: number) {
        if (this.currentPointIndex === -1) {
            this.pickNextPoint();
        }
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
    lastDirectionAnimationFrame: string;

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


