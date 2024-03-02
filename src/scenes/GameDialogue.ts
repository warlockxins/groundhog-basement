export type GameDialogue = {
    rulePre?: Record<string, unknown>;
    rulePreFail?: GameDialogue;
    rulePost?: Record<string, unknown>;
    player?: string;
    playerTexture?: string;
    playerMoveAnim?: string;
    enemy?: string;
    enemySpeed?: {
        x: number; y: number;
    };
    enemyIdle?: string;
    enemyCanChase?: boolean;
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

