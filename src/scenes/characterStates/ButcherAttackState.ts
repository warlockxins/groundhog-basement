import { CharacterState } from './CharacterState'
import { Animations } from 'phaser';
import { GameSceneTop } from '../GameSceneTop';

export class ButcherAttackState extends CharacterState {

    pathGraphicsDebugInfo: Phaser.GameObjects.Graphics | null = null;
    start() {
        // console.log("look at me, I am attacking");

        if (this.character.sprite.scene.matter.world.drawDebug) {
            this.pathGraphicsDebugInfo = this.character.sprite.scene.add.graphics({ lineStyle: { color: 0x00ff00 } });
        }

        (this.character.sprite.scene as GameSceneTop).sounds.knifeSlice.play();

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
