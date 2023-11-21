import { IStateMachineState } from "../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../SlimegCharacterSprite";

export class WalkState implements IStateMachineState {
    slimeg: SlimegCharacterSprite;
    constructor(slimeg: SlimegCharacterSprite) {
        this.slimeg = slimeg;
    }
    enter(): void {
        this.slimeg.sprite.anims.play("walk", true);
    }
    update(deltaTime: number): void {
        this.slimeg.addWalkSpeed(deltaTime);
    }
    exit(): void {}
}
