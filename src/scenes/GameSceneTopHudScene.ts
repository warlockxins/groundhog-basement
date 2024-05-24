import { CST } from "../constants/CST";
import { sceneEventConstants } from './sceneEvents';


export class GameSceneTopHudScene extends Phaser.Scene {
    text: Phaser.GameObjects.Text;
    sanityBarGraphics: Phaser.GameObjects.Graphics;
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

        this.drawSanity(10);

    }
    updateScore(parent, key, data) {
        if (key === 'sanity') {
            this.drawSanity(+data);
        }
    }

    drawSanity(score: number) {

        if (this.sanityBarGraphics) {
            this.sanityBarGraphics.clear();
        }
        this.sanityBarGraphics.fillRect(
            160,
            10,
            60 * score / 10,
            15
        );
        this.sanityBarGraphics.strokeRect(160, 10, 60, 15);
    }
}
