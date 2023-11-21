import { StateMachine } from "../../stateMachine/StateMachine";
import { SlimegCharacterSprite } from "../SlimegCharacterSprite";

import { DeadState } from './DeadState';
import { AliveState } from './AliveState';

enum GROUNDED_CHARACTER_STATE {
    ALIVE,
    DEAD
}

export class SlimegStateMachine extends StateMachine {
    groundedCharacter: SlimegCharacterSprite;

    constructor(grounedCharacter: SlimegCharacterSprite) {
        super();
        this.groundedCharacter = grounedCharacter;
 
        this.addState(
            GROUNDED_CHARACTER_STATE.ALIVE,
            new AliveState(grounedCharacter)
        );
        
        this.addState(
            GROUNDED_CHARACTER_STATE.DEAD,
            new DeadState(grounedCharacter)
        );

        this.initialState = GROUNDED_CHARACTER_STATE.ALIVE;
        this.currentState = GROUNDED_CHARACTER_STATE.ALIVE;
        //-------TRANSITIONS-------
        this.addTransition(
            GROUNDED_CHARACTER_STATE.ALIVE,
            GROUNDED_CHARACTER_STATE.DEAD,
            () => grounedCharacter.health <= 0 
        );
    }
}
