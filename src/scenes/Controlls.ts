import { Character } from './Character';
import { sceneEventConstants } from './sceneEvents';
export class Controlls {
    scene: Phaser.Scene;
    character: Character;
    constructor(scene: Phaser.Scene, character: Character) {
        this.scene = scene;
        this.character = character;
    }

    update(delta: number) { }
}


export class ButcherControlls extends Controlls {
    chasePoint: { x: number, y: number } | null = null;

    circleSearchCharacterEvent: Phaser.Time.TimerEvent;


    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);
        this.character.sprite.on(sceneEventConstants.chase, this.followPoint, this);


        this.circleSearchCharacterEvent = new Phaser.Time.TimerEvent({
            delay: 1110,
            loop: true,
            callback: () => {
                const { x, y } = this.character.sprite;
                const diameter = 150;
                const bodies = this.character.sprite.scene.matter.intersectRect(
                    x - diameter, y - diameter,
                    diameter * 2, diameter * 2
                ).filter((b) => {
                    // @ts-ignore
                    return !b.isStatic && b.label === 'player'
                })

                if (bodies.length > 0) {
                    // from this point enemy will forever chase player, no need to constantly check
                    this.character.bark('I see you');
                    this.character.sprite.scene.time.removeEvent(this.circleSearchCharacterEvent);

                    this.character.followPathState.setEnemyFollowId('player')
                }

            },
            callbackScope: this
        });


        this.character.sprite.scene.time.addEvent(this.circleSearchCharacterEvent);
    }



    followPoint(canChase: boolean, x: number, y: number) {
        this.chasePoint = { x, y };
    }

    update(delta: number) {
        if (this.chasePoint) {

            const dirX = this.chasePoint.x - this.character.sprite.x;
            const dirY = this.chasePoint.y - this.character.sprite.y;

            const runningSpeedScale = this.character.running ? 2 : 1;
            if (Math.abs(dirX) > 10) {
                this.character.sprite.setVelocityX(Math.abs(dirX) / dirX * runningSpeedScale);
            } else {
                this.character.sprite.setVelocityX(0);
            }

            if (Math.abs(dirY) > 10) {
                this.character.sprite.setVelocityY(Math.abs(dirY) / dirY * runningSpeedScale);
            } else {
                this.character.sprite.setVelocityY(0);
            }

            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            if (dist < 50) {
                // stop now and ask for next instructions
                this.chasePoint = null;
                this.character.sprite.emit(sceneEventConstants.arrivedAtObjectPoint);
            }
        }
        else {
            this.character.sprite.setVelocity(0);
        }
    }
}

export class PlayerControlls extends Controlls {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    walkSpeed = 2.5;

    fatigue = 0;
    canRun = true;

    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);

        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    update(delta: number) {
        this.character.sprite.setVelocity(0);

        if (this.character.isDead) return;

        if (this.cursors.shift.isDown) {
            if (this.canRun) {
                this.character.running = true;
                this.fatigue += delta;

                // 6 seconds to run, then need to relax
                if (this.fatigue > 6000) {
                    this.canRun = false;
                }
            } else {

                this.character.running = false;
                this.fatigue -= delta;
                if (this.fatigue <= 0) {
                    this.canRun = true;
                }
            }
        } else {
            this.character.running = false;
        }

        const runningSpeedScale = this.character.running ? 1.5 : 1;
        if (this.character.running) {
            this.character.moveAnim = "run"
        } else {
            this.character.moveAnim = "walk"
        }

        if (this.cursors.left.isDown) {
            this.character.sprite
                .setVelocityX(-this.walkSpeed * runningSpeedScale);
        }
        else if (this.cursors.right.isDown) {

            this.character.sprite
                .setVelocityX(this.walkSpeed * runningSpeedScale);
        }

        if (this.cursors.up.isDown) {

            this.character.sprite
                .setVelocityY(-this.walkSpeed * runningSpeedScale);
        }
        else if (this.cursors.down.isDown) {

            this.character.sprite
                //.setAngle(-180)
                .setVelocityY(this.walkSpeed * runningSpeedScale);
        }
    }
}
