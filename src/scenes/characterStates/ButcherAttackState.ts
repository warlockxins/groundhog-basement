import { CharacterState } from "./CharacterState";
import { Animations } from "phaser";
import { GameSceneTop } from "../GameSceneTop";

export class ButcherAttackState extends CharacterState {
  pathGraphicsDebugInfo: Phaser.GameObjects.Graphics | null = null;
  attackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  collisionDone = false;
  drawDebug: boolean = false;

  start() {
    // console.log("look at me, I am attacking");
    this.collisionDone = false;

    // this.drawDebug = this.character.sprite.scene.matter.world.drawDebug;

    if (this.drawDebug) {
      this.pathGraphicsDebugInfo = this.character.sprite.scene.add.graphics({
        lineStyle: { color: 0x00ff00 },
      });
    }

    (this.character.sprite.scene as GameSceneTop).sounds.knifeSlice.play();
    this.attackVelocity = this.getVectorToPlayer();
    // preserve speed and set frame direction based on speed
    this.character.lastDirection = this.attackVelocity;
    this.character.updateAnimationDirectionFromSpeed();

    this.character.bark("kill");
    this.character.playAnimationFrameOnLastDirection("slice", 0);
    this.character.sprite.once(Animations.Events.ANIMATION_COMPLETE, () => {
      // console.log('time to walk again');
      this.character.setAutoPathFollowSchedule([]);

      this.pathGraphicsDebugInfo?.destroy();
      this.pathGraphicsDebugInfo = null;
    });
  }

  doPlayerCollision() {
    if (this.collisionDone) {
      return;
    }
    this.collisionDone = true;
    const { x, y } = this.character.sprite;
    const normalizedDirection = new Phaser.Math.Vector2(
      this.attackVelocity,
    ).normalize();

    const hitBoxOffset = normalizedDirection.scale(30);

    const diameter = 33;
    const rX = x + hitBoxOffset.x - diameter;
    const rY = y + hitBoxOffset.y - diameter;

    const bodies = this.character.sprite.scene.matter
      .intersectRect(rX, rY, diameter * 2, diameter * 2)
      .filter((b) => {
        // @ts-ignore
        return !b.isStatic && b.label === "player";
      });

    if (bodies.length > 0) {
      const playerBody = bodies[0];

      // @ts-ignore
      playerBody.gameObject.emit("damage", 100);
      this.character.followPathState.setEnemyFollowId(null);

      this.character.bark("BITCH!");
    }

    if (this.drawDebug) {
      this.pathGraphicsDebugInfo?.strokeRect(
        rX,
        rY,
        diameter * 2,
        diameter * 2,
      );
      this.pathGraphicsDebugInfo?.setDepth(rY + 100);
    }
  }

  getVectorToPlayer(): Phaser.Math.Vector2 {
    const { x, y } = this.character.sprite;

    const { x: playerX, y: playerY } =
      this.character.scene.pawnHandler.characters[
        this.character.scene.levelLogic.playerId
      ].sprite;

    const direction = new Phaser.Math.Vector2({
      x: playerX,
      y: playerY,
    }).subtract(new Phaser.Math.Vector2({ x, y }));

    return direction.normalize().scale(0.8);
  }

  destroy() {
    this.pathGraphicsDebugInfo?.destroy();
    this.pathGraphicsDebugInfo = null;
  }

  update() {
    if (this.character.sprite.anims.getProgress() > 0.5) {
      this.doPlayerCollision();
    }

    if (this.character.sprite.anims.getProgress() < 0.4) {
      this.character.sprite.setVelocity(
        this.attackVelocity.x,
        this.attackVelocity.y,
      );
    }
  }
}
