import { Character } from './Character';
import { sceneEventConstants } from './sceneEvents';
import { Controlls } from './BaseControlls';
import { GameSceneTopPossibilities } from './GameSceneTopInterface';

export class ButcherControlls extends Controlls {
    chasePoint: { x: number, y: number } | null = null;

    circleSearchCharacterEvent: Phaser.Time.TimerEvent;


    constructor(scene: Phaser.Scene & GameSceneTopPossibilities, character: Character) {
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
