export class Level {
  playerId: number = -1;
  dialogues: { [key: string]: () => { [key: string]: object } } = {};
}
