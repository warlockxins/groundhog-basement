import { CST } from "../constants/CST";
import { sceneEventConstants } from './sceneEvents';


export class GameSceneTopHudScene extends Phaser.Scene {
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
    }
}
