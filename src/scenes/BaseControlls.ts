import { Character } from './Character';

export class Controlls {
    scene: Phaser.Scene;
    character: Character;
    constructor(scene: Phaser.Scene, character: Character) {
        this.scene = scene;
        this.character = character;
    }

    update(delta: number) { }
}
