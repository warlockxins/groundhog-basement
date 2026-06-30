export type CharacterBark = {
  bark: string;
};

export type CharacterActionByApproval = {
  actionByApproval: GameDialogue;
};

export type CharacterAction = CharacterActionByApproval | CharacterBark;

export type GameDialogue = {
  goScene?: string;
  toggleLight?: string[]; // id of light
  rulePre?: () => boolean;
  rulePreFail?: GameDialogue;
  rulePost?: () => void;
  noteRead?: {
    title: string;
    text: string;
  };
  character?: {
    getCharacterIndex(): number;
    actions: CharacterAction[];
  };
  removeTrigger?: boolean;
  newDialogue?: GameDialogue[];

  changeTileGameObjectToId?: number;
  tween?: Record<string, unknown> & {
    ids: string[];
  };
  onInit?: GameDialogue;
  schedule?: {
    ids: string[];
  };
  sound?: string;
  moveTo?: {
    tileId: string;
    x: number;
    y: number;
  }[];
};
