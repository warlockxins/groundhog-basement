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
  gameOverHudContainer!: Phaser.GameObjects.Container;
  deadLabel: Phaser.GameObjects.Text;

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

    clickButton
      .setInteractive()
      .on("pointerup", () => {
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

    pauseGraphics.fillStyle(0x111111, 0.8);
    pauseGraphics.fillRect(0, 0, +width, +height);

    const pauseLabel = this.add.text(+width / 2, 150, "PAUSE MENU", {
      fontFamily: "Arial Black",
      fontSize: 34,
    });
    pauseLabel.setOrigin(0.5, 1);

    pauseGraphics.lineStyle(2, 0xffffff);
    pauseGraphics.lineBetween(+width / 2 - 90, 160, +width / 2 + 90, 160);

    const resumeButton = this.add
      .text(+width / 2, 230, "Resume", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
        fixedWidth: 150,
        align: "center",
      })
      .setPadding(10)
      .setOrigin(0.5, 1);

    resumeButton
      .setInteractive()
      .on("pointerup", () => {
        this.scene.get(CST.SCENES.GAME).scene.resume();
        this.gameHudContainer.setVisible(true);
        this.pauseHudContainer.setVisible(false);
      })
      .on("pointerover", () => {
        resumeButton.setBackgroundColor("rgba(255, 255, 255, 0.1)");
      })
      .on("pointerout", () => {
        resumeButton.setBackgroundColor("");
      });

    const exitButton = this.add
      .text(+width / 2, 270, "Quit", {
        color: "#ffffff",
        fontFamily: "Arial",
        fixedWidth: 150,
        fontSize: 20,
        align: "center",
      })
      .setPadding(10)
      .setOrigin(0.5, 1);

    exitButton
      .setInteractive()
      .on("pointerup", () => {
        this.scene.launch(CST.SCENES.START_MENU);
        this.game.events.emit(sceneEventConstants.stopGameplayScene);
        this.scene.stop();
      })
      .on("pointerover", () =>
        exitButton.setBackgroundColor("rgba(255, 255, 255, 0.1)"),
      )
      .on("pointerout", () => exitButton.setBackgroundColor(""));

    this.pauseHudContainer = this.add.container(0, 0, [
      pauseGraphics,
      pauseLabel,
      resumeButton,
      exitButton,
    ]);
    this.pauseHudContainer.setVisible(false);
  }

  makeGameOverContainer() {
    const gameOverGraphics = this.add.graphics();
    const { width, height } = this.game.config;

    gameOverGraphics.fillStyle(0x111111, 0.8);
    gameOverGraphics.fillRect(0, 0, +width, +height);

    this.deadLabel = this.add.text(+width / 2, 150, "", {
      fontFamily: "Arial Black",
      fontSize: 34,
      align: "center",
    });
    this.deadLabel.setOrigin(0.5, 1);

    gameOverGraphics.lineStyle(2, 0xffffff);
    gameOverGraphics.lineBetween(+width / 2 - 90, 160, +width / 2 + 90, 160);

    const retryButton = this.add
      .text(+width / 2, 230, "Retry", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
        fixedWidth: 150,
        align: "center",
      })
      .setPadding(10)
      .setOrigin(0.5, 1);

    retryButton
      .setInteractive()
      .on("pointerup", () => {
        this.scene.get(CST.SCENES.GAME).scene.restart();
        this.gameHudContainer.setVisible(true);
        this.pauseHudContainer.setVisible(false);
      })
      .on("pointerover", () => {
        retryButton.setBackgroundColor("rgba(255, 255, 255, 0.1)");
      })
      .on("pointerout", () => {
        retryButton.setBackgroundColor("");
      });

    const exitButton = this.add
      .text(+width / 2, 270, "Quit", {
        color: "#ffffff",
        fontFamily: "Arial",
        fixedWidth: 150,
        fontSize: 20,
        align: "center",
      })
      .setPadding(10)
      .setOrigin(0.5, 1);

    exitButton
      .setInteractive()
      .on("pointerup", () => {
        this.scene.launch(CST.SCENES.START_MENU);
        this.game.events.emit(sceneEventConstants.stopGameplayScene);
        this.scene.stop();
      })
      .on("pointerover", () =>
        exitButton.setBackgroundColor("rgba(255, 255, 255, 0.1)"),
      )
      .on("pointerout", () => exitButton.setBackgroundColor(""));

    this.gameOverHudContainer = this.add.container(0, 0, [
      gameOverGraphics,
      this.deadLabel,
      retryButton,
      exitButton,
    ]);
    this.gameOverHudContainer.setVisible(false);
  }

  makeGameHudContainer() {
    const pauseButton = this.makePauseButton();

    this.text = this.add.text(SANITY_BOX_X, 10, "Sanity", {
      fontFamily: "Arial",
      fontSize: 18,
    });

    //  Check the Registry and hit our callback every time the 'score' value is updated
    this.registry.events.on("changedata", this.onRegistryDataUpdate, this);

    this.sanityBarGraphics = this.add.graphics({
      fillStyle: {
        color: 0xffffff,
      },
      lineStyle: {
        color: 0xaaaaaa,
      },
    });

    this.drawSanity(SANITY_BOX_MAX_WIDTH);

    this.gameHudContainer = this.add.container(0, 0, [
      this.text,
      pauseButton,
      this.sanityBarGraphics,
    ]);
  }

  create() {
    // this.events.on(sceneEventConstants.characterDeath, this.onGameOver, this);
    this.makeGameHudContainer();
    this.makePauseContainer();
    this.makeGameOverContainer();
  }

  onGameOver(cause: "insane" | "damage") {
    this.gameOverHudContainer.setVisible(true);
    this.deadLabel.text =
      cause === "insane" ? "You went\nMad" : "You are\nDead";
  }

  onRegistryDataUpdate(parent, key, data) {
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
