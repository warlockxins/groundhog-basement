export class Character {
    sprite: Phaser.Physics.Matter.Sprite;
    textBubble: Phaser.GameObjects.Text;
    lastDirection: Phaser.Types.Math.Vector2Like = { x: 0, y: 0 };
    myLight: Phaser.GameObjects.Light;
    imageFramePrefix: string;
    defaultAnimation: string;
    moveAnim: string;

    isDead = false;
    controller?: Controlls;

    // TODO - add id to sprite, for getting by id for scripts
    constructor(scene: Phaser.Scene, x: number, y: number, imageFrame: string, imageFramePrefix: string) {

        this.imageFramePrefix = imageFramePrefix;
        this.sprite = scene.matter.add.sprite(x, y, imageFramePrefix + imageFrame);

        this.sprite.play({ key: imageFramePrefix + imageFrame, repeat: -1 });
        this.sprite.setCircle(17, { label: imageFramePrefix })
            .setScale(0.9)
            .setFixedRotation()
            .setOrigin(0.5, 0.9)
            .setPipeline('Light2D');

        this.textBubble = scene.add.text(10, 10, "");
        this.textBubble.setBackgroundColor("#000000");
        this.textBubble.setAlign('center');
        this.textBubble.setMaxLines(2);


        this.myLight = scene.lights.addLight(
            x,
            y,
            100
        ).setColor(0xffffff)
            .setIntensity(1.5);


        // this.textBubble.setText("Bodies everywhere!");
        this.defaultAnimation = 'idle';
        this.moveAnim = 'run';

        this.sprite.on('damage', this.onDamage, this)
    }

    onDamage(value: number) {
        if (this.isDead) return;

        this.isDead = true;
        console.log("OOOOUCH", value);

        const deathAnim = 'playerdeath-S.png'
        if (this.sprite.texture.key !== deathAnim) {
            this.sprite.setTexture(deathAnim);
            this.sprite.play({ key: deathAnim });

            this.sprite.scene.events.emit('characterDeath', this);
        }
    }

    update() {
        this.sprite.setDepth(this.sprite.y);
        this.controller?.update();
        if (this.isDead) {
            return;
        }

        const playerVelocity = this.sprite.getVelocity();

        const y = this.lastDirection.y ?? 0;
        const xAnimFrame = this.lastDirection.x !== 0 ? 'E' : '';
        const yAnimFrame = y > 0 ? 'S' : (y < 0 ? 'N' : '');
        const animDirectionFrameBase = `${yAnimFrame}${xAnimFrame}`;
        const animDirectionFrame = animDirectionFrameBase !== '' ? `-${animDirectionFrameBase}.png` : '-S.png';

        if (playerVelocity.x !== 0 || playerVelocity.y !== 0) {
            this.lastDirection = playerVelocity;
            const walkAnimFrame = `${this.imageFramePrefix}${this.moveAnim}${animDirectionFrame}`;

            this.sprite.flipX = (this.lastDirection.x ?? 0) < 0;
            this.playAnimationFrame(walkAnimFrame);
        }
        else {
            const moveAnim = this.defaultAnimation;
            const idleAnimFrame = `${this.imageFramePrefix}${moveAnim}${animDirectionFrame}`;
            // console.log('>>>>>>', idleAnimFrame);
            this.playAnimationFrame(idleAnimFrame);

        }

        this.textBubble.setPosition(this.sprite.x, this.sprite.y);
        this.textBubble.setDepth(this.sprite.depth + 10000);

        this.myLight.x = this.sprite.x;

        this.myLight.y = this.sprite.y - 50;



    }

    playAnimationFrame(name: string) {
        if (this.sprite.texture.key !== name) {
            this.sprite.setTexture(name);
            this.sprite.play({ key: name, repeat: -1 });
        }
    }
}

class Controlls {
    scene: Phaser.Scene;
    character: Character;
    constructor(scene: Phaser.Scene, character: Character) {
        this.scene = scene;
        this.character = character;
    }

    update() { }
}

export class PlayerControlls extends Controlls {
    update() {
        this.character.sprite.setVelocity(0);

        if (this.character.isDead) return;

        let directionsPressed = false;
        if (this.scene.cursors.left.isDown) {
            directionsPressed = true;
            this.character.sprite
                .setVelocityX(-3);
        }
        else if (this.scene.cursors.right.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityX(3);
        }

        if (this.scene.cursors.up.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityY(-3);
        }
        else if (this.scene.cursors.down.isDown) {

            directionsPressed = true;
            this.character.sprite
                //.setAngle(-180)
                .setVelocityY(3);
        }

        // else if (!directionsPressed && this.scene.cursors.space.isDown && this.character.imageFramePrefix === 'enemy') {
        //     if (this.character.defaultAnimation !== 'slice') {
        //         this.character.defaultAnimation = 'slice';
        //         this.character.sprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, () => {
        //             this.character.sprite.removeAllListeners();
        //             this.character.defaultAnimation = 'idle';
        //         }, this);
        //
        //     }
        // }
    }
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

    update() {
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

            // const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            // if (dist < 30) {
            //
            //     this.enemyCanChase = false;
            //     this.character.defaultAnimation = 'slice';
            // }
        }
        else {
            this.character.sprite.setVelocity(0);
        }
    }
}
