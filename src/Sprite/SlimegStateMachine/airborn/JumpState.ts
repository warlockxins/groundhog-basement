import { IStateMachineState } from "../../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../../SlimegCharacterSprite";

export class JumpState implements IStateMachineState {
    slimeg: SlimegCharacterSprite;
    constructor(slimeg: SlimegCharacterSprite) {
        this.slimeg = slimeg;
    }
    enter(): void {
        //  this.slimeg.body.setVelocityY(-350);
        this.slimeg.sprite.anims.stop();
    }
    update(deltaTime: number): void {
        this.slimeg.addWalkSpeed(0.3 * deltaTime);
    }
    exit(): void {}
}
