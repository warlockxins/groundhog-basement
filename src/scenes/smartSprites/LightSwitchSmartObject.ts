import { SpriteWithDepth } from "./SpriteWithDepth";

export class LightSwitchSmartObject extends SpriteWithDepth {
    indicator: Phaser.GameObjects.Ellipse;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame: number,
    ) {
        super(scene, x, y, texture, frame);
        // console.log("switch time-----");

        this.indicator = scene.add
            .ellipse(x + 64, y + 64, 10, 10, 0xff1111, 1)
            .setDepth(y + 130)
            .setSmoothness(5);

        // in case if needed, can add this to any other object .... copy to config in tiled editor
        scene.tweens.add({
            targets: this.indicator,
            alpha: { from: 0.1, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
        });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }
}