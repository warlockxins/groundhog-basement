export interface IStateMachineState {
    enter(): void;
    update(deltaTime: number): void;
    exit(): void;
}

export interface IStateMachineTransition {
    fromState: number;
    toState: number;
    guard(): boolean;
}
