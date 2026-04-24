import { GameDialogue } from "../GameDialogue";
import { GameSceneTopPossibilities } from "../GameSceneTopInterface";
import { Level } from "./Level";

type DialogMap = {
    [key: string]: () => {
        onEnter: GameDialogue
    }
}

export class LevelOne extends Level {
    scene: Phaser.Scene & GameSceneTopPossibilities;
    constructor(scene: Phaser.Scene & GameSceneTopPossibilities) {
        super()
        this.scene = scene;
    }

    dialogues: DialogMap = {
        // tutorial book
        "78": () => {

            const dialogue: GameDialogue = {
                "character": {
                    "id": "player",
                    "actions": [
                        { "bark": "About this nightmare" },
                        {
                            "actionByApproval": {
                                "noteRead": {
                                    "title": "Remember",
                                    "text": "Stay in the light. Preserve your sanity. \n\nEscape!"
                                }

                            }
                        }
                    ]
                }
            };

            return {
                "onEnter": dialogue
            }
        }
    }



}