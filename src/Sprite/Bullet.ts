export class Bullet extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, xDir: number) {
        super(scene, x, y);
        const bullet = scene.add.graphics({ fillStyle: { color: 0x00ff00 }, lineStyle: { color: 0x00aa00 } });
        const circle = new Phaser.Geom.Circle(0, 0, 5);
        bullet.fillCircleShape(circle);
        this.setSize(5, 5);

        scene.physics.world.enable(this);
        this.body.setBounceY(10);

        this.setDepth(10);

        this.timer = setTimeout(() => {
            this.destroy();
            this.timer = null;
        }, 2000);

        this.add(bullet);

        scene.add.existing(this);

        setTimeout(() => {
            this.body.setVelocity(xDir * 450, 0);
        });
    }

    destroy() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        super.destroy();
    }
}

