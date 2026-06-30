export class CharacterTextBubble {
    scene: Phaser.Scene;
    textBubble: Phaser.GameObjects.Text;
    barkList: Set<string> = new Set();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.textBubble = scene.add.text(10, 10, "");
        this.textBubble.setBackgroundColor("#000000");
        this.textBubble.setAlign("center");
        this.textBubble.setMaxLines(2);
        this.textBubble.setOrigin(0.5, 0.5);

        scene.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                const TIME_SHOW_TEXT = 1500;
                const TIME_DATA_NAME = "time";

                const currentTime =
                    (this.textBubble.getData(TIME_DATA_NAME) ?? 0) - 250;

                if (currentTime > 0) {
                    this.textBubble.setData(TIME_DATA_NAME, currentTime);
                } else {
                    const val = this.barkList.values().next();
                    if (val.value) {
                        this.barkList.delete(val.value!);
                        this.textBubble.setData(TIME_DATA_NAME, TIME_SHOW_TEXT);
                    }
                    const nextText = val.value ?? "";
                    if (this.textBubble.text !== nextText) {
                        this.textBubble.setText(nextText);
                    }
                }
            },
            callbackScope: this,
        });
    }

    clear() {
        this.barkList.clear();
    }

    addText(text: string = "") {
        if (!text) return;

        this.barkList.add(text);
    }

    setPosition(x: number, y: number) {
        this.textBubble.setPosition(x, y);
        this.textBubble.setDepth(y + 10000);
    }
}