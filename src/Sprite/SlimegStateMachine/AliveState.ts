import { StateMachine } from "../../stateMachine/StateMachine";
import { IStateMachineState } from "../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../SlimegCharacterSprite";
import { GroundedState } from './GroundedState';
import { AirbornState } from './airborn/AirbornState';

enum STATES {
    GROUNDED,
    AIRBORN
}

export class AliveState implements IStateMachineState {
    machine: StateMachine;
    character: SlimegCharacterSprite;

    constructor(slimeg: SlimegCharacterSprite) {
        this.machine = new StateMachine();
        this.character = slimeg;

        this.machine.addState(
            STATES.GROUNDED,
            new GroundedState(slimeg)
        );

        this.machine.addState(
            STATES.AIRBORN,
            new AirbornState(slimeg)
        );

        // Transitions
        this.machine.addTransition(
            STATES.AIRBORN,
            STATES.GROUNDED,
            () => slimeg.isOnGround()
        );

        this.machine.addTransition(
            STATES.GROUNDED,
            STATES.AIRBORN,
            () => !slimeg.isOnGround()
        );
    }

    enter(): void {
    }

    update(deltaTime: number): void {
        if (this.character.direction.fire) {
            this.character.fire();
        }

        this.machine.update(deltaTime);
    }

    exit(): void {}
}
