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
  noteReadingContainer!: Phaser.GameObjects.Container;

  activeContainer?: {
    container: Phaser.GameObjects.Container;
    onDismiss?: () => void;
  };

  deadLabel: Phaser.GameObjects.Text;
  noteLabel: Phaser.GameObjects.Text;
  noteText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  keyboardCache = {
    space: false,
    escape: false,
  };
  keyEscape!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: CST.SCENES.GAME_HUD,
    });
  }

  onPauseClick() {
    this.scene.get(CST.SCENES.GAME).scene.pause();
    this.gameHudContainer.setVisible(false);
    this.pauseHudContainer.setVisible(true);

    this.collectKeysWhenOpenMenu();

    this.activeContainer = {
      container: this.pauseHudContainer,
      onDismiss: this.onResume.bind(this),
    };

    // ---- animate appearance
    this.pauseHudContainer.alpha = 0;

    const tween = {
      alpha: { from: "0", to: "1" },
      duration: 300,
      yoyo: false,
      repeat: false,
      ease: "Sine.InOut",
    };
    this.tweens.add({ ...tween, targets: this.pauseHudContainer });
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
        this.onPauseClick();
      })
      .on("pointerover", () => clickButton.setColor("#aaaaaa"))
      .on("pointerout", () => clickButton.setColor("#ffffff"));

    return clickButton;
  }

  onResume() {
    this.scene.get(CST.SCENES.GAME).scene.resume();
    this.gameHudContainer.setVisible(true);
    this.pauseHudContainer.setVisible(false);
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
        this.onResume();
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

  onCloseNoteReadingContainer() {
    this.scene.get(CST.SCENES.GAME).scene.resume();
    this.gameHudContainer.setVisible(true);
    this.noteReadingContainer.setVisible(false);
  }

  makeNoteReadingContainer() {
    const noteGraphics = this.add.graphics();
    const { width, height } = this.game.config;

    noteGraphics.fillStyle(0x111111, 1);
    const backgroundWidth = +width / 2 - 50;
    noteGraphics.fillRect(0, 50, backgroundWidth, +height - 100);

    this.noteLabel = this.add.text(backgroundWidth / 2, 110, "Note", {
      fontFamily: "Arial Black",
      fontSize: 34,
      align: "center",
    });
    this.noteLabel.setOrigin(0.5, 1);

    this.noteText = this.add.text(30, 155, "Note", {
      fontFamily: "Arial Black",
      fontSize: 22,
      align: "left",
      wordWrap: {
        width: backgroundWidth - 60,
      },
    });

    noteGraphics.lineStyle(2, 0xffffff);
    noteGraphics.lineBetween(50, 130, backgroundWidth - 50, 130);

    // add vertical line
    noteGraphics.lineStyle(2, 0xffffff, 0.1);
    noteGraphics.lineBetween(0, 50, 0, +height - 50);

    const closeButton = this.add
      .text(backgroundWidth / 2, +height - 70, "Close", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
        fixedWidth: 150,
        align: "center",
      })
      .setPadding(10)
      .setOrigin(0.5, 1);

    closeButton
      .setInteractive()
      .on("pointerup", () => {
        this.onCloseNoteReadingContainer();
      })
      .on("pointerover", () => {
        closeButton.setBackgroundColor("rgba(255, 255, 255, 0.1)");
      })
      .on("pointerout", () => {
        closeButton.setBackgroundColor("");
      });

    this.noteReadingContainer = this.add.container(+width / 2, 0, [
      noteGraphics,
      this.noteLabel,
      this.noteText,
      closeButton,
    ]);
    this.noteReadingContainer.setVisible(false);
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
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.makeGameHudContainer();
    this.makePauseContainer();
    this.makeGameOverContainer();
    this.makeNoteReadingContainer();

    this.keyEscape = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    this.activeContainer = undefined;
  }

  onGameOver(cause: "insane" | "damage") {
    this.gameOverHudContainer.setVisible(true);
    this.deadLabel.text =
      cause === "insane" ? "You went\nMad" : "You are\nDead";

    this.activeContainer = {
      container: this.gameOverHudContainer,
    };
  }

  collectKeysWhenOpenMenu() {
    this.keyboardCache.space = this.cursors.space.isDown;
    this.keyboardCache.escape = this.keyEscape.isDown;
  }

  onShowNoteReader(title: string, text: string) {
    this.scene.get(CST.SCENES.GAME).scene.pause();
    this.gameHudContainer.setVisible(false);
    this.noteReadingContainer.setVisible(true);
    this.noteLabel.text = title;
    this.noteText.text = text;
    this.collectKeysWhenOpenMenu();

    const originalPosition = this.noteReadingContainer.x;
    this.noteReadingContainer.x = this.game.canvas.width;

    // animate appearance
    const tween: Phaser.Types.Tweens.TweenBuilderConfig = {
      x: { from: this.game.canvas.width, to: originalPosition },
      duration: 250,
      yoyo: false,
      ease: "Sine.InOut",
      targets: this.noteReadingContainer,
    };

    const tweenAlpha: Phaser.Types.Tweens.TweenBuilderConfig = {
      alpha: { from: "0", to: "1" },
      duration: 350,
      yoyo: false,
      ease: "Sine.InOut",
      targets: this.noteReadingContainer,
    };

    this.tweens.add(tween);
    this.tweens.add(tweenAlpha);
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

  // wow this sucks. Should have made different scenes to handle all cases separaely. But it works
  update(time: number, delta: number): void {
    if (!this.keyboardCache.space && this.cursors.space.isDown) {
      if (this.noteReadingContainer.visible) {
        this.onCloseNoteReadingContainer();
      }
    }

    if (
      this.activeContainer &&
      this.activeContainer.onDismiss &&
      this.keyEscape.isDown &&
      !this.keyboardCache.escape
    ) {
      this.activeContainer.onDismiss();
      this.activeContainer = undefined;
      this.keyboardCache.escape = true;
    } else if (
      !this.activeContainer &&
      !this.keyboardCache.escape &&
      this.keyEscape.isDown &&
      !this.noteReadingContainer.visible
    ) {
      this.onPauseClick();
    }

    if (this.cursors.space.isUp) {
      this.keyboardCache.space = false;
    }

    if (this.keyEscape.isUp) {
      this.keyboardCache.escape = false;
    }
  }
}
