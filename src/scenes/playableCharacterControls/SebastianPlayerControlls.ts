import { Controlls } from '../BaseControlls';
import { Character } from '../Character';
import { sceneEventConstants } from '../sceneEvents';
import { SebastianPlayableCharacerAnimations } from './SebastianPlayableCharacerAnimations';



export class SebastianPlayerControlls extends Controlls {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    walkSpeed = 2.5;

    fatigue = 0;
    canRun = true;
    playableCharacterController: SebastianPlayableCharacerAnimations;

    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.playableCharacterController = new SebastianPlayableCharacerAnimations(character.sprite);
        this.playableCharacterController.start();

    }
    update(delta: number) {
        this.character.sprite.setVelocity(0);

        if (this.character.isDead) return;

        this.playableCharacterController.moveIntent.up = this.cursors.up.isDown;
        this.playableCharacterController.moveIntent.right = this.cursors.right.isDown;
        this.playableCharacterController.moveIntent.down = this.cursors.down.isDown;
        this.playableCharacterController.moveIntent.left = this.cursors.left.isDown;
        this.playableCharacterController.moveIntent.run = this.cursors.shift.isDown;

        this.playableCharacterController.update();
    }

    onDamage(cause: string): void {
        const deathAnim = 'sebastian-death-' + this.playableCharacterController.animationDirection;

        const { sprite } = this.character;
        if (this.character.sprite.texture.key !== deathAnim) {
            sprite.setTexture(deathAnim);
            sprite.play({ key: deathAnim, repeat: 0 });

            sprite.scene.events.emit(sceneEventConstants.characterDeath, this.character, cause);
        }
    }
}
