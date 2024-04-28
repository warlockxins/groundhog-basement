import { Character } from './Character';
import { sceneEventConstants } from './sceneEvents';
export class Controlls {
    scene: Phaser.Scene;
    character: Character;
    constructor(scene: Phaser.Scene, character: Character) {
        this.scene = scene;
        this.character = character;
    }

    update(delta: number) { }
}


export class ButcherControlls extends Controlls {
    enemyCanChase: boolean = false;
    chasePoint: { x: number, y: number } = { x: 0, y: 0 };
    chaseSprite?: Phaser.Physics.Matter.Sprite;

    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);

        this.character.sprite.on('chase', this.followPoint, this);
    }

    followPoint(canChase: boolean, x: number, y: number, chaseSprite: Phaser.Physics.Matter.Sprite | undefined) {
        this.enemyCanChase = canChase;
        this.chasePoint = { x, y };
        this.chaseSprite = chaseSprite;
    }

    update(delta: number) {
        if (this.enemyCanChase) {
            // just check if sprite exists/not removed or whatever and update chase point
            if (this.chaseSprite?.x) {
                this.chasePoint = {
                    x: this.chaseSprite.x,
                    y: this.chaseSprite.y
                }
            }

            const dirX = this.chasePoint.x - this.character.sprite.x;
            const dirY = this.chasePoint.y - this.character.sprite.y;

            if (Math.abs(dirX) > 10) {
                this.character.sprite.setVelocityX(Math.abs(dirX) / dirX);
            } else {
                this.character.sprite.setVelocityX(0);
            }

            if (Math.abs(dirY) > 10) {
                this.character.sprite.setVelocityY(Math.abs(dirY) / dirY);
            } else {
                this.character.sprite.setVelocityY(0);
            }

            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            if (dist < 50) {
                this.enemyCanChase = false;
                this.character.sprite.emit(sceneEventConstants.arrivedAtObjectPoint);
            }
        }
        else {
            this.character.sprite.setVelocity(0);
        }
    }
}

export class PlayerControlls extends Controlls {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, character: Character) {
        super(scene, character);

        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    update(delta: number) {
        this.character.sprite.setVelocity(0);

        if (this.character.isDead) return;

        let directionsPressed = false;

        if (this.cursors.left.isDown) {
            directionsPressed = true;
            this.character.sprite
                .setVelocityX(-3);
        }
        else if (this.cursors.right.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityX(3);
        }

        if (this.cursors.up.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityY(-3);
        }
        else if (this.cursors.down.isDown) {

            directionsPressed = true;
            this.character.sprite
                //.setAngle(-180)
                .setVelocityY(3);
        }
    }
}
