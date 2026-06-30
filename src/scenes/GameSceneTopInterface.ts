import { NavMeshPoint } from "../levelComponents/NavMesh";

export interface GameSceneTopPossibilities {
    onRequestCharacterFollowPath: (from: NavMeshPoint, { characterId, point }: { characterId: string | null, point: { x: number, y: number } }) => NavMeshPoint[] | null
}
