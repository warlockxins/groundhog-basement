import { Controlls } from "./BaseControlls";
import { CharacterState } from "./characterStates/CharacterState";
import { ButcherAttackState } from "./characterStates/ButcherAttackState";
import { CharacterWithGoToScheduledPointState } from "./characterStates/CharacterWithGoToScheduledPointState";
import { GameDialogue } from "./GameDialogue";
import { GameSceneTopPossibilities } from "./GameSceneTopInterface";
import { PathPoint } from "~/levelComponents/PathPlanner";
import { ActionIndicator } from "./ActionIndicator";
import { CharacterTextBubble } from "./CharacterTextBubble";

class CharacterWithControllerState extends CharacterState {
  update(delta: number) {
    this.character.controller?.update(delta);
    this.character.updateShadowLightDepth();
  }
}

export class Character {
  scene: Phaser.Scene & GameSceneTopPossibilities;
  sprite: Phaser.Physics.Matter.Sprite;

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

  actionByApproval?: GameDialogue;

  running = false;
  actionIndicator!: ActionIndicator;
  characterTextBubble: CharacterTextBubble;

  // TODO - add id to sprite, for getting by id for scripts
  constructor(
    scene: Phaser.Scene & GameSceneTopPossibilities,
    x: number,
    y: number,
    imageFrame: string,
    imageFramePrefix: string,
  ) {
    this.scene = scene;
    this.currentState = new CharacterWithControllerState(this);
    this.imageFramePrefix = imageFramePrefix;
    this.sprite = scene.matter.add.sprite(x, y, imageFramePrefix + imageFrame);

    this.sprite
      .setCircle(17, {
        label: imageFramePrefix,
        collisionFilter: {
          category: 1,
          mask: 1,
        },
      })
      .setFixedRotation()
      .setOrigin(0.5, 0.9)
      .setPipeline("Light2D");

    this.sprite.setDisplaySize(30, 30);

    // an optimisation - collision callbacks will reference this to know if
    // body is a character first, and by label later.
    // @ts-expect-error
    this.sprite.body.isCharacter = true;

    this.characterTextBubble = new CharacterTextBubble(scene);



    this.shadow = scene.add.ellipse(x, y, 30, 15, 0x111111, 0.3);
    this.shadow.setSmoothness(8);

    this.actionIndicator = new ActionIndicator(scene);

    this.myLight = scene.lights
      .addLight(x, y, 100)
      .setColor(0xffffff)
      .setIntensity(0.5);

    this.defaultAnimation = "idle";
    this.moveAnim = "walk";

    this.sprite.on("damage", this.onDamage, this);


  }

  setAutoPathFollowSchedule(autoPathFollowSchedule: PathPoint[]) {
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

    this.currentState = this.attackState;
    this.sprite.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.attackState.start();
      },
      callbackScope: this,
    });
  }

  bark(text: string = "") {
    if (this.isDead) {
      this.characterTextBubble.clear()
      return;
    }

    this.characterTextBubble.addText(text);
  }

  addActionForApproval(actionByApproval?: GameDialogue) {
    this.actionByApproval = actionByApproval;

    this.actionIndicator.setVisible(!!actionByApproval);
  }

  executeActionByApproving() {
    if (!this.actionByApproval) {
      return;
    }

    this.scene.processGameDialogue(this.actionByApproval);
  }

  onDamage(value: number) {
    if (this.isDead) return;

    this.isDead = true;
    this.controller?.onDamage("damage");
  }

  onMadeInsane() {
    if (this.isDead) return;
    this.isDead = true;
    this.controller?.onDamage("insane");
  }

  updateAnimationDirectionFromSpeed(): string {
    const y = this.lastDirection.y ?? 0;
    const xAnimFrame = this.lastDirection.x !== 0 ? "E" : "";
    const yAnimFrame = y > 0 ? "S" : y < 0 ? "N" : "";
    const animDirectionFrameBase = `${yAnimFrame}${xAnimFrame}`;
    const animDirectionFrame =
      animDirectionFrameBase !== "" ? `-${animDirectionFrameBase}` : "-S";
    this.lastDirectionAnimationFrame = animDirectionFrame;
    return animDirectionFrame;
  }

  updateShadowLightDepth() {
    this.sprite.setDepth(this.sprite.y);
    this.shadow.x = this.sprite.x;
    this.shadow.y = this.sprite.y + 5;
    this.shadow.setDepth(this.sprite.y - 10);

    this.characterTextBubble.setPosition(this.sprite.x, this.sprite.y)

    this.myLight.x = this.sprite.x;

    this.myLight.y = this.sprite.y - 50;

    if (this.actionByApproval) {
      this.actionIndicator.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  updatePositionAndDirectionBasedOnSpeed(delta: number) {
    this.updateShadowLightDepth();

    if (this.isDead) {
      return;
    }

    const playerVelocity = this.sprite.getVelocity();

    this.updateAnimationDirectionFromSpeed();

    if (playerVelocity.x !== 0 || playerVelocity.y !== 0) {
      this.lastDirection = playerVelocity;

      this.sprite.flipX = (this.lastDirection.x ?? 0) < 0;
      this.playAnimationFrameOnLastDirection(this.moveAnim);
    } else {
      const moveAnim = this.defaultAnimation;
      this.playAnimationFrameOnLastDirection(moveAnim);
    }
  }

  playAnimationFrameOnLastDirection(name: string, repeat = -1) {
    const animFrame = `${this.imageFramePrefix}-${name}${this.lastDirectionAnimationFrame}`;
    this.playAnimationFrame(animFrame, repeat);
  }

  playAnimationFrame(name: string, repeat = -1) {
    if (this.sprite.anims.currentAnim?.key !== name) {
      this.sprite.play({ key: name, repeat: repeat });
    }
  }
}
