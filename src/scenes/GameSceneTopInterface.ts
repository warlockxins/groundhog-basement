import { NavMeshPoint } from "../levelComponents/NavMesh";
import { soundSource } from '../constants/sounds';
import { PawnHandler } from "./PawnHandler";

export interface GameSceneTopPossibilities {
    pawnHandler: PawnHandler;
    findClosestLight(p: { x: number, y: number }, maxDistance?: number): number | null;
    onRequestCharacterFollowPath: (from: NavMeshPoint, { characterId, point }: { characterId: string | null, point: { x: number, y: number } }) => NavMeshPoint[] | null,
    sounds: Record<keyof typeof soundSource, Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound>
}
