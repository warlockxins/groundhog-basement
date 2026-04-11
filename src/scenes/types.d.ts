
export type AnimationDirection = 'N' | 'NE' | 'E' | 'SE' | 'S';
export type AnimationConfig = Record<string, Record<AnimationDirection, string[]>>;

type CustomTileObjectProperty = {
    value: unknown;
    name: string;
    type: string;
};

type CustomTileObject = {
    flippedAntiDiagonal: boolean;
    flippedHorizontal: boolean;
    flippedVertical: boolean;
    gid: number;
    height: number;
    id: number;
    name: string;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
    properties: CustomTileObjectProperty[];
};