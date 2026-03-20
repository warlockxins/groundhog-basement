export interface I_AnimationState {
    start: () => void;
    update: () => I_AnimationState;
    end: () => void;
}
;
export type TMoveSpeed = {
    x: number;
    y: number;
};
