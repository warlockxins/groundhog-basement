import { StateMachine } from "../../../stateMachine/StateMachine";
import { IStateMachineState } from "../../../stateMachine/interfaces";
import { SlimegCharacterSprite } from "../../SlimegCharacterSprite";
import {JumpState} from './JumpState';
import {FallState} from './FallState';

enum STATES {
    JUMP,
    FALL
}

export class AirbornState implements IStateMachineState {
    machine: StateMachine;
    slimeg: SlimegCharacterSprite;

    constructor(slimeg: SlimegCharacterSprite) {
        this.machine = new StateMachine();
        this.slimeg = slimeg;

        this.machine.addState(
            STATES.JUMP,
            new JumpState(slimeg)
        );

        this.machine.addState(
            STATES.FALL,
            new FallState(slimeg)
        );

        // Transitions
        this.machine.addTransition(
            STATES.JUMP,
            STATES.FALL,
            () => slimeg.body.velocity.y > 0
        );

        this.machine.addTransition(
            STATES.FALL,
            STATES.JUMP,
            () => slimeg.body.velocity.y < 0
        );
    }

    enter(): void {
        // set previousState to non existent to trigger on start for new substate
        this.machine.previousState = -1;
        this.machine.currentState =  this.slimeg.body.velocity.y >= 0 ? STATES.FALL : STATES.JUMP;
        //this.slimeg.body.setSize(5, 38);
    }

    update(deltaTime: number): void {
        this.machine.update(deltaTime);
        const dir = this.slimeg.sprite.flipX ? 1 : -1;
        // 10 is max angle, by max speed
        const coeff = this.slimeg.body.velocity.y /this.slimeg.body.maxVelocity.y * 10; 

        this.slimeg.sprite.setRotation(dir * coeff * 3.14 / 180);
    }

    exit(): void {
        this.machine.exitCurrentState();
        this.slimeg.sprite.setRotation(0);
        //this.slimeg.body.setSize(20, 38);
    }
}
