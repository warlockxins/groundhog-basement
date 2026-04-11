export class SpriteWithDepth extends Phaser.Physics.Matter.Sprite {
    constructor(scene: Phaser.Scene, x, y, texture, frame) {
        super(scene.matter.world, x, y, texture, frame);
        this.setTexture(texture);
        scene.add.existing(this);

        this.setFrame(frame);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.setDepth(this.y + 1);
    }
}