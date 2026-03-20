import { NavMeshPoint } from "../levelComponents/NavMesh";
import { soundSource } from '../constants/sounds';

export interface GameSceneTopPossibilities {
    onRequestCharacterFollowPath: (from: NavMeshPoint, { characterId, point }: { characterId: string | null, point: { x: number, y: number } }) => NavMeshPoint[] | null,
    sounds: Record<keyof typeof soundSource, Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound>
}
