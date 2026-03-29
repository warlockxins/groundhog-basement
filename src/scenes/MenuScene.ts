import { CST } from "../constants/CST";

const UI_X = 100;

// Great that this exists https://www.youtube.com/watch?v=55DzXMkCfVA
export class MenuScene extends Phaser.Scene {
  startButton!: Phaser.GameObjects.Text;
  activeButtonHighlight!: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: CST.SCENES.START_MENU,
    });
  }

  init(data) {
    console.log("data passed to this scene", data);
  }

  preload() { }
  create() {
    console.log("===? goooooooo");

    this.activeButtonHighlight = this.add.graphics();
    this.drawActiveButtonBackground(250, false);

    this.startButton = this.add.text(UI_X, 250, "Start Game", {
      align: "center",
      color: "#000000",
      fontFamily: "Arial Black",
      fontSize: 34,
      fontStyle: "bold",
    });
    //.setOrigin(0.5, 0);

    this.startButton
      .setInteractive()
      .on("pointerup", () => this.startPressed())
      .on("pointerover", () => this.enterButtonHoverState())
      .on("pointerout", () => this.enterButtonRestState());

    this.add.text(UI_X, 150, "Dream Butcher", {
      fontFamily: "Arial Black",
      fontSize: 70,
    });
    // .setOrigin(0.5, 0);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  drawActiveButtonBackground(yStart: number = 300, selected = false) {
    const y = yStart - 10;
    this.activeButtonHighlight.clear();

    const bg = selected ? 0xffffff : 0xcccccc;
    this.activeButtonHighlight.fillGradientStyle(0x000000, bg, 0x000000, bg, 1);
    this.activeButtonHighlight.fillRect(UI_X - 40, y, 40, 54);

    this.activeButtonHighlight.fillGradientStyle(bg, 0x000000, bg, 0x000000, 1);
    this.activeButtonHighlight.fillRect(UI_X, y, 400, 54);
  }

  // Todo = start intro
  // https://labs.phaser.io/edit.html?src=src\game%20objects\text\align%20text.js
  startPressed() {
    this.scene.start(CST.SCENES.GAME, { levelId: "basement" });
    this.scene.stop();
  }

  enterButtonHoverState() {
    this.drawActiveButtonBackground(250, true);
  }

  enterButtonRestState() {
    this.drawActiveButtonBackground(250, false);
  }
}
