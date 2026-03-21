import { CST } from "../constants/CST";
import { sceneEventConstants } from './sceneEvents';

const SANITY_BOX_X = 160;

const SANITY_BOX_MAX_WIDTH = 60;
export class GameSceneTopHudScene extends Phaser.Scene {
    text: Phaser.GameObjects.Text;
    sanityBarGraphics: Phaser.GameObjects.Graphics;
    currentSanity: number = 10;

    constructor() {
        super({
            key: CST.SCENES.GAME_HUD,
        });
    }



    makePauseButton() {
        const clickButton = this.add.text(10, 10, "Exit", {
            color: '#00a6ed',
            fontFamily: 'Arial Black', fontSize: 24,
        }).setScrollFactor(0)


        clickButton
            .setInteractive()
            .on("pointerdown", () => this.pausePressed())

    }

    pausePressed() {
        this.scene.launch(CST.SCENES.START_MENU);
        this.game.events.emit(sceneEventConstants.stopGameplayScene);
        this.scene.stop()
    }


    create() {
        this.makePauseButton();

        this.text = this.add.text(100, 10, 'Sanity');

        //  Check the Registry and hit our callback every time the 'score' value is updated
        this.registry.events.on('changedata', this.updateScore, this);

        this.sanityBarGraphics = this.add.graphics({
            fillStyle: {
                color: 0xffffff,
            },
            lineStyle: {
                color: 0xaaaaaa
            }
        });

        this.drawSanity(SANITY_BOX_MAX_WIDTH);

    }
    updateScore(parent, key, data) {
        if (key === 'sanity') {
            const newHealth = +data;
            const newWidth = (newHealth / 10) * SANITY_BOX_MAX_WIDTH;

            this.tweens.addCounter({
                from: (this.currentSanity / 10) * SANITY_BOX_MAX_WIDTH,
                to: newWidth,
                duration: 500, // make sure this is less than players (1 sec)
                onUpdate: tween => {
                    this.drawSanity(tween.getValue());
                }
            });

            this.currentSanity = newHealth;
        }
    }

    drawSanity(width: number) {
        if (this.sanityBarGraphics) {
            this.sanityBarGraphics.clear();
        }

        if (width > SANITY_BOX_MAX_WIDTH / 2) {
            this.sanityBarGraphics.fillStyle(0x00ffff, 1);
        } else { this.sanityBarGraphics.fillStyle(0xff0000, 1); }

        this.sanityBarGraphics.fillRect(
            SANITY_BOX_X,
            10,
            width,
            15
        );
        this.sanityBarGraphics.strokeRect(160, 10, 60, 15);
    }
}
