import { ControllableCharacter, ScriptComponent, MoveDirection } from "~/Sprite/interfaces";

export class PlatformerInput implements ScriptComponent {
    keyboard: { Space: { isDown: boolean; }; A: { isDown: boolean; }; D: { isDown: boolean; }; W: { isDown: boolean; }; };
    direction: MoveDirection;

    constructor(scene: Phaser.Scene, gameObject: ControllableCharacter) {
        this.keyboard = scene.input.keyboard.addKeys("W, A, S, D, Space");
        this.direction = gameObject.direction;
    }
    update() {
        this.direction.fire = this.keyboard.Space.isDown;
        this.direction.x = this.keyboard.A.isDown ? -1 : 0 + (this.keyboard.D.isDown ? 1 : 0);
        this.direction.y = this.keyboard.W.isDown ? 1 : 0;
    }
    destroy() { }
};
