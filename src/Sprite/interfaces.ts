export interface ScriptComponent {
    update: Function;
    destroy: Function;
}


export interface MoveDirection {
    fire: boolean;
    x: number;
    y: number;
}

export interface ControllableCharacter {
    direction: MoveDirection,
    scriptComponents: ScriptComponent[]
}
