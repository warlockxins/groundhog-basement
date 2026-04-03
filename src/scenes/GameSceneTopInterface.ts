import { NavMeshPoint } from "../levelComponents/NavMesh";
import { soundSource } from "../constants/sounds";
import { PawnHandler } from "./PawnHandler";
import { GameDialogue } from "./GameDialogue";

export interface GameSceneTopPossibilities {
  pawnHandler: PawnHandler;
  findClosestLight(
    p: { x: number; y: number },
    maxDistance?: number,
  ): number | null;
  onRequestCharacterFollowPath: (
    from: NavMeshPoint,
    {
      characterId,
      point,
    }: { characterId: string | null; point: { x: number; y: number } },
  ) => NavMeshPoint[] | null;
  sounds: Record<
    keyof typeof soundSource,
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
  >;

  processGameDialogue(d: GameDialogue, gameObject?: Phaser.Physics.Matter.Image, receiver?: Phaser.GameObjects.GameObject): boolean
}
