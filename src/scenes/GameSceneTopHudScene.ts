import { CST } from "../constants/CST";
import { sceneEventConstants } from "./sceneEvents";

const SANITY_BOX_X = 100;

const SANITY_BOX_MAX_WIDTH = 70;
export class GameSceneTopHudScene extends Phaser.Scene {
  text: Phaser.GameObjects.Text;
  sanityBarGraphics: Phaser.GameObjects.Graphics;
  currentSanity: number = 10;

  gameHudContainer!: Phaser.GameObjects.Container;
  pauseHudContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: CST.SCENES.GAME_HUD,
    });
  }

  makePauseButton() {
    const clickButton = this.add
      .text(10, 10, "Pause", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 18,
      })
      .setScrollFactor(0);

    clickButton.setInteractive().on("pointerup", () => {
      this.scene.get(CST.SCENES.GAME).scene.pause();
      this.gameHudContainer.setVisible(false);
      this.pauseHudContainer.setVisible(true);
    })
      .on("pointerover", () => clickButton.setColor("#aaaaaa"))
      .on("pointerout", () => clickButton.setColor("#ffffff"));

    return clickButton;
  }

  makePauseContainer() {
    const pauseGraphics = this.add.graphics();
    const { width, height } = this.game.config;

    pauseGraphics.fillStyle(0x000000, 0.4);
    pauseGraphics.fillRect(0, 0, +width, +height);

    const pauseLabel = this.add.text(+width / 2, 150, "PAUSE MENU", {
      fontFamily: "Arial Black",
      fontSize: 34,
    });
    pauseLabel.setOrigin(0.5, 1);

    pauseGraphics.lineStyle(2, 0xffffff);
    pauseGraphics.lineBetween(+width / 2 - 90, 160, +width / 2 + 90, 160);

    const resumeButton = this.add
      .text(+width / 2, 210, "Resume", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
      });
    resumeButton.setOrigin(0.5, 1);

    resumeButton.setInteractive().on("pointerup", () => {
      this.scene.get(CST.SCENES.GAME).scene.resume();
      this.gameHudContainer.setVisible(true);
      this.pauseHudContainer.setVisible(false);
    })
      .on("pointerover", () => resumeButton.setColor("#aaaaaa"))
      .on("pointerout", () => resumeButton.setColor("#ffffff"));

    const exitButton = this.add
      .text(+width / 2, 250, "Quit", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
      });
    exitButton.setOrigin(0.5, 1);

    exitButton.setInteractive().on("pointerup", () => {
      this.scene.launch(CST.SCENES.START_MENU);
      this.game.events.emit(sceneEventConstants.stopGameplayScene);
      this.scene.stop();
    })
      .on("pointerover", () => exitButton.setColor("#aaaaaa"))
      .on("pointerout", () => exitButton.setColor("#ffffff"));

    this.pauseHudContainer = this.add.container(0, 0, [pauseGraphics, pauseLabel, resumeButton, exitButton]);
    this.pauseHudContainer.setVisible(false);
  }

  makeGameHudContainer() {

    const pauseButton = this.makePauseButton();

    this.text = this.add.text(SANITY_BOX_X, 10, "Sanity", {
      fontFamily: "Arial",
      fontSize: 18,
    });

    //  Check the Registry and hit our callback every time the 'score' value is updated
    this.registry.events.on("changedata", this.updateScore, this);

    this.sanityBarGraphics = this.add.graphics({
      fillStyle: {
        color: 0xffffff,
      },
      lineStyle: {
        color: 0xaaaaaa,
      },
    });

    this.drawSanity(SANITY_BOX_MAX_WIDTH);

    this.gameHudContainer = this.add.container(0, 0, [this.text, pauseButton, this.sanityBarGraphics]);
  }

  create() {
    this.makeGameHudContainer();
    this.makePauseContainer();
  }
  updateScore(parent, key, data) {
    if (key === "sanity") {
      const newHealth = +data;
      const newWidth = (newHealth / 10) * SANITY_BOX_MAX_WIDTH;

      this.tweens.addCounter({
        from: (this.currentSanity / 10) * SANITY_BOX_MAX_WIDTH,
        to: newWidth,
        duration: 500, // make sure this is less than players (1 sec)
        onUpdate: (tween) => {
          this.drawSanity(tween.getValue());
        },
      });

      this.currentSanity = newHealth;
    }
  }

  drawSanity(width: number) {
    if (this.sanityBarGraphics) {
      this.sanityBarGraphics.clear();
    }

    if (width > SANITY_BOX_MAX_WIDTH / 2) {
      this.sanityBarGraphics.fillStyle(0xffffff, 1);
    } else {
      this.sanityBarGraphics.fillStyle(0xff0000, 1);
    }

    this.sanityBarGraphics.fillRect(SANITY_BOX_X, 40, width, 8);
    this.sanityBarGraphics.strokeRect(
      SANITY_BOX_X,
      40,
      SANITY_BOX_MAX_WIDTH,
      8,
    );
  }
}
