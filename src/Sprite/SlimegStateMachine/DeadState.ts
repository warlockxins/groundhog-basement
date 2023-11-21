import { IStateMachineState } from "../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../SlimegCharacterSprite";

export class DeadState implements IStateMachineState {
    slimeg: SlimegCharacterSprite;
    constructor(slimeg: SlimegCharacterSprite) {
        this.slimeg = slimeg;
    }
    enter(): void {
        this.slimeg.sprite.anims.stop();
        this.slimeg.sprite.flipY = true;
        this.slimeg.body.setVelocityY(-150);
    }
    update(deltaTime: number): void {
    }
    exit(): void { }
}
