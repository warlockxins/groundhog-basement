import { Character } from "./Character";

export class PawnHandler {
  characters: Character[] = [];

  add(key: number, c: Character): number {
    return this.characters.push(c) - 1;
  }

  update(_time: number, delta: number) {
    for (const c of this.characters) {
      c.currentState.update(delta);
    }
  }
}
