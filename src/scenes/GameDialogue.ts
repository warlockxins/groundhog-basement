export type GameDialogue = {
    goScene?: string;
    toggleLight?: string[]; // id of light
    rulePre?: Record<string, unknown>;
    rulePreFail?: GameDialogue;
    rulePost?: Record<string, unknown>;
    character?: {
        id: string;
        actions: Record<'bark', string>[]
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
    }
};

