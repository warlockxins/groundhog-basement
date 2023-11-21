import d from 'dijkstra';
import { StateMachine } from "../stateMachine/StateMachine";
import { SlimegStateMachine } from "./SlimegStateMachine";

import { ScriptComponent } from "../scriptComponent/scriptComponent";
import { DamageController } from './DamageController';

import { Bullet } from "./Bullet";
import { ControllableCharacter, MoveDirection } from './interfaces';

export class SlimegCharacterSprite extends Phaser.GameObjects.Container implements ControllableCharacter {
    direction: MoveDirection;
    scriptComponents: ScriptComponent[] = [];
    body!: Phaser.Physics.Arcade.Body;
    stateMachine!: StateMachine;

    text!: Phaser.GameObjects.Text;

    sprite!: Phaser.GameObjects.Sprite;

    health = 3;
    damageController: DamageController;

    blinkTween: Phaser.Tweens.Tween;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(scene, x, y);
        scene.sys.updateList.add(this);
        scene.sys.displayList.add(this);
        this.setSize(20, 38);

        this.sprite = scene.add.sprite(0, 0, "slimeg", "slime1.png");
        this.sprite.setScale(0.2);
        // this.sprite.setOrigin(0.5);
        // this.sprite.setDisplayOrigin(0.5, 0.5);
        this.add(this.sprite);
        this.sprite.flipX = false;

        this.blinkTween = scene.tweens.add({
            targets: this.sprite,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0.2
            },
            duration: 100,
            ease: 'Power1',
            yoyo: true,
            repeat: 3,
            paused: true
        });

        scene.physics.world.enableBody(this);
        this.body.setMaxVelocity(150, 280);

        this.direction = {
            fire: false,
            x: 0,
            y: 0
        }

        this.stateMachine = new SlimegStateMachine(this);
        this.createText();

        this.damageController = new DamageController(this);

    }

    addScriptComponent(item: ScriptComponent) {
        this.scriptComponents.push(item);
    }

    createText() {
        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: "Arial",
            fontSize: "14px",
            color: "#ff0044",
            // wordWrap: true,
            // wordWrapWidth: this.width,
            align: "center",
            backgroundColor: "#ffff00",
            padding: { x: 5, y: 5 },
            // stroke: "#ff0000",
            // strokeThickness: 2,
        };

        this.text = this.scene.add.text(
            0,
            -40,
            "",
            style
        );
        this.text.setOrigin(0.5);
        this.add(this.text);
        // this.text.setVisible(false);
    }

    handleScriptComponents(delta) {
        for (let i = 0; i < this.scriptComponents.length; ++i) {
            this.scriptComponents[i].update(delta) ;
        }
    }

    kill() {
        this.health = 0;
    }

    addDamage(amount: number) {
        this.damageController.addDamage(amount);
    }

    addWalkSpeed(increase: number) {
        this.body.velocity.x = this.direction.x * 100;
        if (this.direction.x < 0) {
            this.sprite.flipX = false;
        } else if (this.direction.x > 0) {
            this.sprite.flipX = true;
        }
    }

    isOnGround(): boolean {
        return this.body.onFloor();
    }

    hasNoHorizontalSpeed(): boolean {
        return Math.abs(this.body.velocity.x) === 0;
    }

    jump(): boolean {
        this.body.setVelocityY(-600);
    }

    fire() {
        if (this.bullet) return;
        this.bullet = true;
        setTimeout(() => {
            this.bullet = false;
        }, 100);

        const dir = this.sprite.flipX ? 1 : -1;
        const xPos = this.x + (10 * dir);
        const bulleInstancet = new Bullet(this.scene, xPos, this.y + 5, dir);
        this.scene.playerBulletGroup.add(bulleInstancet);
    }

    preUpdate(time: number, delta: number) {
        this.handleScriptComponents(delta);
        this.stateMachine.update(delta);
    }
}
