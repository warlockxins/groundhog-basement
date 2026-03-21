import { CharacterState } from './CharacterState'
import { NavMeshPoint } from '../../levelComponents/NavMesh';
import { sceneEventConstants } from '../sceneEvents';
import { GameSceneTopPossibilities } from '../GameSceneTopInterface';
export class CharacterWithGoToScheduledPointState extends CharacterState {
    autoFollowPathPoints: NavMeshPoint[] = [];
    currentPointIndex = -1;

    fetchFollowPathEvent!: Phaser.Time.TimerEvent;
    pathGraphicsDebugInfo: Phaser.GameObjects.Graphics | null = null;

    followingCharacter: string | null = null;
    followingWithAngerTimer: {
        elapsed: number; // 5 seconds to get angry
        coolingDown: boolean;
    } | null = null;

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

                // if (this.followingCharacter && newPath?.length > 10) {
                // this.setEnemyFollowId(null);
                // } else {
                this.setAutoFollowPathPoints(newPath);
                // }
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

        if (id) {
            this.followingWithAngerTimer = {
                elapsed: 0,
                coolingDown: false
            };
        } else {
            this.followingWithAngerTimer = null;
        }
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

        if (this.followingWithAngerTimer) {
            if (this.followingWithAngerTimer.coolingDown) {
                this.followingWithAngerTimer.elapsed -= delta;
                this.character.running = true;

                if (this.followingWithAngerTimer.elapsed < 0) {
                    this.followingWithAngerTimer.coolingDown = false;
                    this.followingWithAngerTimer.elapsed = 0;
                }
            } else {
                this.followingWithAngerTimer.elapsed += delta;
                this.character.running = false;

                // after 5 seconds just run for several seconds - freak out
                if (this.followingWithAngerTimer.elapsed > 5000) {
                    this.followingWithAngerTimer.coolingDown = true;
                    this.character.bark("That's it, BITCH!");
                }
            }

            // TODO - this is shit. Move to some state or smth
            if (this.followingCharacter && this.character.controller?.scene.pawnHandler.characters[this.followingCharacter]) {
                if (this.character.controller?.scene.pawnHandler.characters[this.followingCharacter].isDead) {
                    this.setEnemyFollowId(null);
                    this.character.bark("Wuss!");
                }
            }
        }

        this.character.controller?.update(delta);
        this.character.updatePositionAndDirectionBasedOnSpeed(delta)
    }
}
