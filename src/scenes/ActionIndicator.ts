export class ActionIndicator {
    actionIndicator: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene) {
        const actionIndicator = scene.add.graphics({
            lineStyle: { color: 0xffffff, width: 2 },
        });

        actionIndicator.strokeEllipse(0, 0, 20, 20, 8);

        actionIndicator.moveTo(-4, -3);
        actionIndicator.lineTo(-4, 3);
        actionIndicator.lineTo(4, 3);
        actionIndicator.lineTo(4, -3);
        actionIndicator.strokePath();

        this.actionIndicator = actionIndicator;
    }

    setVisible(visible) {
        this.actionIndicator.setVisible(visible)
    }

    setPosition(x: number, y: number) {
        this.actionIndicator.x = x
        this.actionIndicator.y = y - 120;
        this.actionIndicator.setDepth(y + 10000);
    }
}