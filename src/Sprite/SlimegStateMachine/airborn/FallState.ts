import { IStateMachineState } from "../../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../../SlimegCharacterSprite";

const FALL_AFTER_MILISECONDS = 2000;

export class FallState implements IStateMachineState {
    slimeg: SlimegCharacterSprite;
    timer: number = 0;

    constructor(slimeg: SlimegCharacterSprite) {
        this.slimeg = slimeg;
    }

    enter(): void {
        this.slimeg.sprite.anims.play("stand", false);
        this.timer = 0;
    }

    update(deltaTime: number): void {
        this.slimeg.addWalkSpeed(0.3 * deltaTime);
        this.timer += deltaTime;
    }

    exit(): void {
        if (this.timer > FALL_AFTER_MILISECONDS) {
            this.slimeg.addDamage(1);
        }
    }
}
