// possibly could be better
// https://www.mkelly.me/blog/phaser-finite-state-machine/
//
// modified from https://github.com/drhayes/impactjs-statemachine
import { IStateMachineState, IStateMachineTransition } from "./interfaces";

export class StateMachine {
    states: IStateMachineState[];
    transitions: IStateMachineTransition[];
    initialState: number;
    currentState: number;
    previousState: number;
    context: { [key: string]: any };

    constructor() {
        this.states = [];
        this.transitions = [];
        // Track states by index.
        this.initialState = 0;
        this.currentState = 0;
        this.previousState = 0;
        this.context = {};
    }

    addState(index: number, smState: IStateMachineState) {
        if (!smState) {
            throw new Error("Missing State body: ");
        }
        this.states[index] = smState;
        if (!this.initialState) {
            this.initialState = index;
            this.currentState = index;
        }
    }

    addTransition(fromState: number, toState: number, predicate) {
        if (!this.states[fromState]) {
            throw new Error("Missing from state: " + fromState);
        }
        if (!this.states[toState]) {
            throw new Error("Missing to state: " + toState);
        }
        const transition: IStateMachineTransition = {
            fromState: fromState,
            toState: toState,
            guard: predicate,
        };
        this.transitions.push(transition);
    }

    update(delta: number) {
        const state = this.states[this.currentState];

        if (this.previousState !== this.currentState) {
            if (state.enter) {
                state.enter();
            }
            this.previousState = this.currentState;
        }

        if (state.update) {
            state.update(delta);
        }
        // Iterate through transitions.
        for (const transition of this.transitions) {
            if (
                transition.fromState === this.currentState &&
                transition.guard()
            ) {
                if (state.exit) {
                    state.exit();
                }
                this.currentState = transition.toState;
                return;
            }
        }
    }

    exitCurrentState() {
        const state = this.states[this.currentState];

        if (state?.exit) {
            state.exit();
            this.previousState = -1;
        }
    }
}
