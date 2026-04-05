export type CharacterBark = {
  bark: string;
};

export type CharacterActionByApproval = {
  actionByApproval: GameDialogue;
};

export type CharacterAction = CharacterActionByApproval & CharacterBark;

export type GameDialogue = {
  goScene?: string;
  toggleLight?: string[]; // id of light
  rulePre?: Record<string, unknown>;
  rulePreFail?: GameDialogue;
  rulePost?: Record<string, unknown>;
  noteRead?: {
    title: string;
    text: string;
  };
  character?: {
    id: string;
    actions: CharacterAction[];
  };
  removeTrigger: boolean;
  newDialogue?: GameDialogue[];

  changeTileGameObjectToId?: number;
  tween?: Record<string, unknown> & {
    ids: string[];
  };
  onInit?: GameDialogue;
  schedule?: {
    ids: string[];
  };
  sound: string;
  moveTo: {
    tileId: string;
    x: number;
    y: number;
  }[];
};
