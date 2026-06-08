import { sceneEventConstants } from "./sceneEvents";
import { Controlls } from "./BaseControlls";
import { NavMeshPoint } from "~/levelComponents/NavMesh";
import { CharacterState } from "./characterStates/CharacterState";
import { ButcherAttackState } from "./characterStates/ButcherAttackState";
import { CharacterWithGoToScheduledPointState } from "./characterStates/CharacterWithGoToScheduledPointState";
import { GameDialogue } from "./GameDialogue";
import { GameSceneTopPossibilities } from "./GameSceneTopInterface";

class CharacterWithControllerState extends CharacterState {
  update(delta: number) {
    this.character.controller?.update(delta);
    this.character.updateShadowLightDepth();
  }
}

export class Character {
  scene: Phaser.Scene & GameSceneTopPossibilities;
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

  barkList: Set<string> = new Set();
  actionByApproval?: GameDialogue;

  running = false;
  actionIndicator!: Phaser.GameObjects.Graphics;

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
      .setScale(0.7)
      // .setDisplaySize(30, 80)
      .setFixedRotation()
      .setOrigin(0.5, 0.9)
      .setPipeline("Light2D");

    // an optimisation - collision callbacks will reference this to know if
    // body is a character first, and by label later.
    // @ts-expect-error
    this.sprite.body.isCharacter = true;

    // this.sprite.displayWidth = 10;
    this.textBubble = scene.add.text(10, 10, "");
    this.textBubble.setBackgroundColor("#000000");
    this.textBubble.setAlign("center");
    this.textBubble.setMaxLines(2);
    this.textBubble.setOrigin(0.5, 0.5);

    this.shadow = scene.add.ellipse(x, y, 30, 15, 0x111111, 0.3);
    this.shadow.setSmoothness(8);

    this.createActionIndicator(scene);

    this.myLight = scene.lights
      .addLight(x, y, 100)
      .setColor(0xffffff)
      .setIntensity(1.0);

    // this.textBubble.setText("Bodies everywhere!");
    this.defaultAnimation = "idle";
    this.moveAnim = "walk";

    this.sprite.on("damage", this.onDamage, this);

    this.sprite.scene.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => {
        const TIME_SHOW_TEXT = 1500;
        const TIME_DATA_NAME = "time";

        const currentTime =
          (this.textBubble.getData(TIME_DATA_NAME) ?? 0) - 250;

        if (currentTime > 0) {
          this.textBubble.setData(TIME_DATA_NAME, currentTime);
        } else {
          const val = this.barkList.values().next();
          if (val.value) {
            this.barkList.delete(val.value!);
            this.textBubble.setData(TIME_DATA_NAME, TIME_SHOW_TEXT);
          }
          const nextText = val.value ?? "";
          if (this.textBubble.text !== nextText) {
            this.textBubble.setText(nextText);
          }
        }
      },
      callbackScope: this,
    });
  }

  createActionIndicator(scene: Phaser.Scene) {
    this.actionIndicator = scene.add.graphics({
      lineStyle: { color: 0xffffff, width: 2 },
    });

    this.actionIndicator.strokeEllipse(0, 0, 20, 20, 8);

    this.actionIndicator.moveTo(-4, -3);
    this.actionIndicator.lineTo(-4, 3);
    this.actionIndicator.lineTo(4, 3);
    this.actionIndicator.lineTo(4, -3);
    this.actionIndicator.strokePath();
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
      this.barkList.clear();
      return;
    }
    console.log("will bark", text);
    if (!text) return;

    this.barkList.add(text);
  }

  addActionForApproval(actionByApproval?: GameDialogue) {
    this.actionByApproval = actionByApproval;

    if (actionByApproval) {
      this.actionIndicator.setVisible(true);
    } else {
      this.actionIndicator.setVisible(false);
    }
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

  animationDirectionFromSpeed(): string {
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
    this.shadow.y = this.sprite.y - 5;
    this.shadow.setDepth(this.sprite.y - 10);

    this.textBubble.setPosition(this.sprite.x, this.sprite.y);
    this.textBubble.setDepth(this.sprite.depth + 10000);

    this.myLight.x = this.sprite.x;

    this.myLight.y = this.sprite.y - 50;

    if (this.actionByApproval) {
      this.actionIndicator.x = this.sprite.x;
      this.actionIndicator.y = this.sprite.y - 120;
      this.actionIndicator.setDepth(this.textBubble.depth);
    }
  }

  updatePositionAndDirectionBasedOnSpeed(delta: number) {
    this.updateShadowLightDepth();

    if (this.isDead) {
      return;
    }

    const playerVelocity = this.sprite.getVelocity();

    this.animationDirectionFromSpeed();

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
