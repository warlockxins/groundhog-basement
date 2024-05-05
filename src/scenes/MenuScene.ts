import { CST } from "../constants/CST";
// Great that this exists https://www.youtube.com/watch?v=55DzXMkCfVA
export class MenuScene extends Phaser.Scene {
    clickButton!: Phaser.GameObjects.Text;
    gradient: CanvasGradient;
    gradientHover: CanvasGradient;

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
        this.clickButton = this.add.text(400, 100, "Start!", {
            align: 'center',
            color: '#00a6ed',
            fontFamily: 'Arial Black', fontSize: 34,
        }).setOrigin(0.5, 0);
        this.clickButton
            .setInteractive()
            .on("pointerdown", () => this.startPressed())
            .on("pointerover", () => this.enterButtonHoverState())
            .on("pointerout", () => this.enterButtonRestState());


        const text = this.add.text(25, 250, 'Dream Butcher', { fontFamily: 'Arial Black', fontSize: 60 });
        text.setStroke('#000000', 4);

        //  Apply the gradient fill.
        const gradient = text.context.createLinearGradient(0, 0, 0, text.height);
        gradient.addColorStop(0, '#111111');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(0.5, '#aaaaaa');
        gradient.addColorStop(1, '#111111');
        this.gradient = gradient;



        const gradientHover = text.context.createLinearGradient(0, 0, 0, text.height);
        gradientHover.addColorStop(0, '#111111');
        gradientHover.addColorStop(0.5, '#bbbbbb');
        gradientHover.addColorStop(0.5, '#aaaaaa');
        gradientHover.addColorStop(1, '#111111');
        this.gradientHover = gradientHover;


        text.setFill(gradient);
        this.clickButton.setFill(gradient);

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    // Todo = start intro
    // https://labs.phaser.io/edit.html?src=src\game%20objects\text\align%20text.js
    startPressed() {
        this.scene.start(CST.SCENES.GAME);
        this.scene.stop();
    }

    enterButtonHoverState() {
        this.clickButton.setFill(this.gradientHover);
    }

    enterButtonRestState() {
        this.clickButton.setFill(this.gradient);
    }
}
