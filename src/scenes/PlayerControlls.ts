import { Controlls } from './BaseControlls';
import { Character } from './Character';
import { PlayableCharacterController } from './playableCharacterControls/PlayableCharacterControls';



export class PlayerControlls extends Controlls {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    walkSpeed = 2.5;

    fatigue = 0;
    canRun = true;
    playableCharacterController: PlayableCharacterController;
    // player!: Phaser.Physics.Matter.Sprite;

    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.playableCharacterController = new PlayableCharacterController(character.sprite)

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
    /*
    oldUpdate(delta: number) {
        if (this.cursors.shift.isDown) {
            if (this.canRun) {
                this.character.running = true;
                this.fatigue += delta;

                // 6 seconds to run, then need to relax
                if (this.fatigue > 6000) {
                    this.canRun = false;
                }
            } else {

                this.character.running = false;
                this.fatigue -= delta;
                if (this.fatigue <= 0) {
                    this.canRun = true;
                }
            }
        } else {
            this.character.running = false;
        }

        const runningSpeedScale = this.character.running ? 1.5 : 1;
        if (this.character.running) {
            this.character.moveAnim = "run";
        } else {
            this.character.moveAnim = "walk";
        }

        let moving = false;

        if (this.cursors.left.isDown) {
            moving = true;
            this.character.sprite
                .setVelocityX(-this.walkSpeed * runningSpeedScale);
        }
        else if (this.cursors.right.isDown) {
            moving = true;
            this.character.sprite
                .setVelocityX(this.walkSpeed * runningSpeedScale);
        }

        if (this.cursors.up.isDown) {
            moving = true;
            this.character.sprite
                .setVelocityY(-this.walkSpeed * runningSpeedScale);
        }
        else if (this.cursors.down.isDown) {
            moving = true;
            this.character.sprite
                //.setAngle(-180)
                .setVelocityY(this.walkSpeed * runningSpeedScale);
        }

        if (moving) {
            const sound = (this.character.sprite.scene as GameSceneTop).sounds.step;
            if (!sound.isPlaying) {
                sound.volume = 0.3;
                sound.play();
            }
        }
    }
        */
}
