import { CST } from "../constants/CST";
// Great that this exists https://www.youtube.com/watch?v=55DzXMkCfVA
export class MenuScene extends Phaser.Scene {
    clickButton!: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: CST.SCENES.MENU,
        });
    }

    init(data) {
        console.log("data passed to this scene", data);
    }

    preload() {}
    create() {
        // this.scene.start(CST.SCENES.MENU);
        // this.clickCountText = this.add.text(100, 200, "");

        this.clickButton = this.add.text(100, 100, "Start!", { fill: "#0f0" });
        this.clickButton
            .setInteractive()
            .on("pointerdown", () => this.startPressed())
            .on("pointerover", () => this.enterButtonHoverState())
            .on("pointerout", () => this.enterButtonRestState());
    }

    startPressed() {
        this.scene.start(CST.SCENES.GAME);
        // this.clickCountText.setText(
        //     `Button has been clicked ${clickCount} times.`
        // );
    }

    enterButtonHoverState() {
        this.clickButton.setStyle({ fill: "#ff0" });
    }

    enterButtonRestState() {
        this.clickButton.setStyle({ fill: "#0f0" });
    }
}
