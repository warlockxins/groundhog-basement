import { StateMachine } from "../../stateMachine/StateMachine";
import { IStateMachineState } from "../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../SlimegCharacterSprite";
import { StandState } from './StandState';
import { WalkState } from './WalkState';

enum STATES {
    STAND,
    WALK
}

export class GroundedState implements IStateMachineState {
    machine: StateMachine;
    slimeg: SlimegCharacterSprite;

    constructor(slimeg: SlimegCharacterSprite) {
        this.machine = new StateMachine();
        this.slimeg = slimeg;

        this.machine.addState(
            STATES.STAND,
            new StandState(slimeg)
        );

        this.machine.addState(
            STATES.WALK,
            new WalkState(slimeg)
        );

        // Transitions
        this.machine.addTransition(
            STATES.WALK,
            STATES.STAND,
            slimeg.hasNoHorizontalSpeed.bind(slimeg)
        );

        this.machine.addTransition(
            STATES.STAND,
            STATES.WALK,
            () => !slimeg.hasNoHorizontalSpeed()
        );
    }

    enter(): void {
        // reset machine previousState
        this.machine.previousState = -1;

        this.machine.currentState = this.slimeg.hasNoHorizontalSpeed() ? STATES.WALK : STATES.STAND;
    }

    update(deltaTime: number): void {
        if (this.slimeg.direction.y > 0) {
            this.slimeg.jump();
        }

        this.machine.update(deltaTime);
    }

    exit(): void {}
}
