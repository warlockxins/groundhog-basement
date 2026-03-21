import { Controlls } from '../BaseControlls';
import { Character } from '../Character';
import { GameSceneTopPossibilities } from '../GameSceneTopInterface';
import { sceneEventConstants } from '../sceneEvents';
import { LightSanityChecker } from './LightSanityChecker';
import { SebastianStates } from './SebastianStates';



export class SebastianPlayerControlls extends Controlls {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    walkSpeed = 2.5;

    fatigue = 0;
    canRun = true;
    states: SebastianStates;
    lightSanityChecker: LightSanityChecker;

    constructor(scene: Phaser.Scene & GameSceneTopPossibilities, character: Character) {
        super(scene, character);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.states = new SebastianStates(character.sprite);
        this.states.start();

        this.lightSanityChecker = new LightSanityChecker(scene, character)

    }
    update(delta: number) {
        this.character.sprite.setVelocity(0);

        if (this.character.isDead) return;

        this.states.moveIntent.up = this.cursors.up.isDown;
        this.states.moveIntent.right = this.cursors.right.isDown;
        this.states.moveIntent.down = this.cursors.down.isDown;
        this.states.moveIntent.left = this.cursors.left.isDown;

        this.states.update();
    }

    onDamage(cause: string): void {
        const deathAnim = 'sebastian-death-' + this.states.animationDirection;

        const { sprite } = this.character;
        if (this.character.sprite.texture.key !== deathAnim) {
            sprite.setTexture(deathAnim);
            sprite.play({ key: deathAnim, repeat: 0 });

            sprite.scene.events.emit(sceneEventConstants.characterDeath, this.character, cause);
        }
    }
}
