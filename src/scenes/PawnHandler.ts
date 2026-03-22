import { Character } from "./Character";

export class PawnHandler {
    characters: Record<string, Character> = {};
    _characterCache: Character[] = [];

    add(key: string, c: Character) {
        this.characters[key] = c;
        this._characterCache = Object.values(this.characters);
    }

    update(_time: number, delta: number) {
        // for (const c of Object.values(this.characters)) {
        for (const c of this._characterCache) {
            c.currentState.update(delta);
        }
    }
}
