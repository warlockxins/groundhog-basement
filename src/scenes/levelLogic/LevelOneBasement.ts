import { GameDialogue } from "../GameDialogue";
import { GameSceneTopPossibilities } from "../GameSceneTopInterface";
import { Level } from "./Level";

type DialogMap = {
  [key: string]: () => {
    onEnter: GameDialogue;
  };
};

export class LevelOne extends Level {
  scene: Phaser.Scene & GameSceneTopPossibilities;
  playerId = 8;

  constructor(scene: Phaser.Scene & GameSceneTopPossibilities) {
    super();
    this.scene = scene;
  }

  dialogues: DialogMap = {
    // tutorial book
    "78": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            { bark: "About this nightmare" },
            {
              actionByApproval: {
                noteRead: {
                  title: "Remember",
                  text: "Stay in the light. Preserve your sanity. \n\nEscape!",
                },
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // first light switch
    "56": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            { bark: "Keep the light on" },
            {
              actionByApproval: {
                toggleLight: ["27"],
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // second light switch
    "45": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            { bark: "Toggle the Light" },
            {
              actionByApproval: {
                toggleLight: ["41"],
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // corner hall light switch
    "44": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            {
              actionByApproval: {
                toggleLight: ["46"],
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // Column  light switch
    "47": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            {
              actionByApproval: {
                toggleLight: ["36", "42"],
              },
            },
          ],
        },
      };
      return {
        onEnter: dialogue,
      };
    },
    // Column  light switch
    "50": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            {
              actionByApproval: {
                toggleLight: ["3"],
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // behind door  light switch
    "51": () => {
      const dialogue: GameDialogue = {
        character: {
          id: this.playerId,
          actions: [
            {
              actionByApproval: {
                toggleLight: ["6"],
              },
            },
          ],
        },
      };
      return {
        onEnter: dialogue,
      };
    },
    // locked door
    "11": () => {
      const dialogue: GameDialogue = {
        changeTileGameObjectToId: "17",
        rulePre: {
          "==": [{ var: "haveKey" }, true],
        },
        rulePreFail: {
          sound: "tryDoor",
          character: {
            id: this.playerId,
            actions: [{ bark: "It's locked" }],
          },
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // hallway - is that blood text
    "61": () => {
      const dialogue: GameDialogue = {
        removeTrigger: true,
        character: {
          id: this.playerId,
          actions: [{ bark: "Is that\nBlood?" }],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // bodies everywhere text
    "62": () => {
      const dialogue: GameDialogue = {
        removeTrigger: true,
        character: {
          id: this.playerId,
          actions: [{ bark: "Bodies everywhere!" }],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // Door key
    "10": () => {
      const dialogue: GameDialogue = {
        removeTrigger: true,
        rulePost: {
          setVar: ["haveKey", true],
        },
        sound: "itemPut",
        moveTo: [
          {
            tileId: "63",
            x: 1024,
            y: 2304,
          },
          {
            tileId: "64",
            x: 1152,
            y: 2304,
          },
        ],
        character: {
          id: this.playerId,
          actions: [{ bark: "Now to that door!" }],
        },
      };
      return {
        onEnter: dialogue,
      };
    },
    // unexpected fence
    "66": () => {
      const dialogue: GameDialogue = {
        rulePre: {
          "==": [{ var: "haveKey" }, true],
        },
        removeTrigger: true,
        character: {
          id: this.playerId,
          actions: [{ bark: "But ...\n where?!" }],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // book 1 - guide to book 2
    "65": () => {
      const dialogue: GameDialogue = {
        rulePre: {
          "==": [{ var: "haveKey" }, true],
        },
        character: {
          id: this.playerId,
          actions: [
            { bark: "The book:\nHow to escape" },
            {
              actionByApproval: {
                noteRead: {
                  title: "The Book",
                  text: "One book points...\nthe other reveals.\nSomething dark stands in the way.",
                },
                rulePost: {
                  setVar: ["readBook", true],
                },
              },
            },
          ],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // book 2 - guide to table corpse
    "70": () => {
      const dialogue: GameDialogue = {
        rulePre: {
          "==": [{ var: "readBook" }, true],
        },
        character: {
          id: this.playerId,
          actions: [
            { bark: "The book:\nLook within" },
            {
              actionByApproval: {
                noteRead: {
                  title: "The Book",
                  text: "Inspect yourself - the way out is within.\nThough you lie there upon the table.",
                },
                toggleLight: ["71"],
                rulePost: {
                  setVar: ["lookWithin", true],
                },
              },
            },
          ],
        },
      };
      return {
        onEnter: dialogue,
      };
    },
    // table corpse
    "79": () => {
      const dialogue: GameDialogue = {
        rulePre: {
          "==": [{ var: "lookWithin" }, true],
        },
        character: {
          id: this.playerId,
          actions: [
            {
              actionByApproval: {
                noteRead: {
                  title: "The Within",
                  text: "Faces are blurred here.\nI reach between the ribs and touch my own shadow.\nThe memory returns. The mental block is gone.",
                },
                moveTo: [
                  {
                    tileId: "63",
                    x: -1024,
                    y: 2304,
                  },
                  {
                    tileId: "64",
                    x: -1152,
                    y: 2304,
                  },
                ],
              },
            },
          ],
        },
      };
      return {
        onEnter: dialogue,
      };
    },
    // question before saw room
    "57": () => {
      const dialogue: GameDialogue = {
        removeTrigger: true,
        character: {
          id: this.playerId,
          actions: [{ bark: "Now what" }],
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // activate saws
    "32": () => {
      const dialogue: GameDialogue = {
        removeTrigger: true,
        tween: {
          ids: ["20", "21", "22", "24", "25"],
          x: 600,
          duration: 3000,
          yoyo: true,
          ease: "Linear",
          repeat: -1,
        },
      };

      return {
        onEnter: dialogue,
      };
    },
    // exit door
    "26": () => {
      const dialogue: GameDialogue = {
        goScene: "bloodPool",
      };

      return {
        onEnter: dialogue,
      };
    },
  };
}
