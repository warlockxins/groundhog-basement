export class Level {
  private _playerIndex: number = -1;

  public getPlayerIndex(): number {
    return this._playerIndex;
  }

  public setPlayerIndex(v: number) {
    this._playerIndex = v;
  }

  dialogues: { [key: string]: () => { [key: string]: object } } = {};
}
