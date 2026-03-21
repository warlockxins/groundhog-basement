import { Character } from './Character';
import { GameSceneTopPossibilities } from './GameSceneTopInterface';

export class Controlls {
    scene: Phaser.Scene & GameSceneTopPossibilities;
    character: Character;
    constructor(scene: Phaser.Scene & GameSceneTopPossibilities, character: Character) {
        this.scene = scene;
        this.character = character;
    }

    update(delta: number) { }

    onDamage(cause: string) { }
}
