import { soundSource } from "../constants/sounds";
import { PawnHandler } from "./PawnHandler";
import { GameDialogue } from "./GameDialogue";
import { Level } from "./levelLogic/Level";
import { PathPoint } from "~/levelComponents/PathPlanner";

export interface GameSceneTopPossibilities {
  pawnHandler: PawnHandler;
  findClosestLight(
    p: { x: number; y: number },
    maxDistance?: number,
  ): number | null;
  onRequestCharacterFollowPath: (
    from: PathPoint,
    {
      characterId,
      point,
    }: { characterId: number | null; point: { x: number; y: number } },
  ) => PathPoint[] | null;
  sounds: Record<
    keyof typeof soundSource,
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
  >;

  processGameDialogue(
    d: GameDialogue,
    gameObject?: Phaser.Physics.Matter.Image,
    receiver?: Phaser.GameObjects.GameObject,
  ): boolean;

  levelLogic: Level;
}
