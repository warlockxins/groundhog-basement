import { Controlls } from "../BaseControlls";
import { Character } from "../Character";
import { GameSceneTopPossibilities } from "../GameSceneTopInterface";
import { sceneEventConstants } from "../sceneEvents";
import { LightSanityChecker } from "./LightSanityChecker";
import { SebastianStates } from "./SebastianStates";

export class SebastianPlayerControlls extends Controlls {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  walkSpeed = 2.5;

  fatigue = 0;
  canRun = true;
  states: SebastianStates;
  lightSanityChecker: LightSanityChecker;
  keyW: Phaser.Input.Keyboard.Key;
  keyA: Phaser.Input.Keyboard.Key;
  keyS: Phaser.Input.Keyboard.Key;
  keyD: Phaser.Input.Keyboard.Key;

  constructor(
    scene: Phaser.Scene & GameSceneTopPossibilities,
    character: Character,
  ) {
    super(scene, character);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keyW = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.states = new SebastianStates(character);
    this.states.start();

    this.lightSanityChecker = new LightSanityChecker(scene, character);
  }
  update(delta: number) {
    this.character.sprite.setVelocity(0);

    if (this.character.isDead) return;

    this.states.moveIntent.up = this.cursors.up.isDown || this.keyW.isDown;
    this.states.moveIntent.right =
      this.cursors.right.isDown || this.keyD.isDown;
    this.states.moveIntent.down = this.cursors.down.isDown || this.keyS.isDown;
    this.states.moveIntent.left = this.cursors.left.isDown || this.keyA.isDown;

    // Note - action intent only available if character has saved pending Action
    // and displays action icon
    this.states.moveIntent.action = !!this.character.actionByApproval && this.cursors.space.isDown;

    this.states.update();
  }

  onDamage(cause: "damage" | "insane"): void {

    if (cause === "damage") {
      this.scene.sounds.hurt.play({ loop: false });
    } else if (cause === "insane") {
      this.scene.sounds.cry.play({ loop: false });
    }

    const deathAnim = "sebastian-death-" + this.states.animationDirection;

    const { sprite } = this.character;
    if (this.character.sprite.texture.key !== deathAnim) {
      sprite.setTexture(deathAnim);
      sprite.play({ key: deathAnim, repeat: 0 });

      sprite.scene.events.emit(
        sceneEventConstants.characterDeath,
        this.character,
        cause,
      );
    }
  }
}
