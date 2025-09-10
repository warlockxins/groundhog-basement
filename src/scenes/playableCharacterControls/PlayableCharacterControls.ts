import { AnimationDirection } from "../types";

interface IState {
    start: () => void;
    update: () => IState;
    end: () => void;
};

type TMoveSpeed = {
    x: number;
    y: number;
}

const walkSpeed = 2.5;

export class PlayableCharacterController implements IState {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    sprite: Phaser.Physics.Matter.Sprite;
    facing: { vertical: 'N' | 'S' | ''; horizontal: 'E' | ''; } = { vertical: '', horizontal: '' };
    animationDirection: AnimationDirection = 'S';
    currentState!: IState;

    states = {
        idle: new Standing(this, 'idle'),
        goUp: new Moving(this, 'walk', { x: 0, y: -walkSpeed }),
        goUpRight: new Moving(this, 'walk', { x: walkSpeed, y: -walkSpeed }),
        goRight: new Moving(this, 'walk', { x: walkSpeed, y: 0 }),
        goDownRight: new Moving(this, 'walk', { x: walkSpeed, y: walkSpeed }),
        goDown: new Moving(this, 'walk', { x: 0, y: walkSpeed }),
        goDownLeft: new Moving(this, 'walk', { x: -walkSpeed, y: walkSpeed }),
        goLeft: new Moving(this, 'walk', { x: -walkSpeed, y: 0 }),
        goUpLeft: new Moving(this, 'walk', { x: -walkSpeed, y: -walkSpeed }),
    }

    moveIntent = {
        up: false, right: false, down: false, left: false, run: false
    }

    constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys,) {
        this.sprite = sprite;
        this.cursors = cursors;
        this.currentState = this.states.idle;
    }
    start() {
        this.currentState.start();
    }
    update(): IState {
        this.moveIntent.up = this.cursors.up.isDown;
        this.moveIntent.right = this.cursors.right.isDown;
        this.moveIntent.down = this.cursors.down.isDown;
        this.moveIntent.left = this.cursors.left.isDown;
        this.moveIntent.run = this.cursors.shift.isDown;

        const nextState = this.currentState.update();
        if (nextState !== this.currentState) {
            this.currentState = nextState;
            nextState.start();
        }

        return this;
    }
    end() { }
}

class MovableRoot implements IState {
    controller: PlayableCharacterController;
    animation: string;
    speed: TMoveSpeed;

    constructor(controller: PlayableCharacterController, animation: string, speed: TMoveSpeed = { x: 0, y: 0 }) {
        this.controller = controller;
        this.animation = animation;
        this.speed = speed;
    }
    start() {
    }
    update(): IState {
        if (this.controller.moveIntent.up) {
            if (this.controller.moveIntent.right) {
                return this.controller.states.goUpRight;
            } else if (this.controller.moveIntent.left) {
                return this.controller.states.goUpLeft;
            }

            return this.controller.states.goUp;
        } else if (this.controller.moveIntent.down) {
            if (this.controller.moveIntent.right) {
                return this.controller.states.goDownRight;
            } else if (this.controller.moveIntent.left) {
                return this.controller.states.goDownLeft;
            }

            return this.controller.states.goDown;
        }

        if (this.controller.moveIntent.right) {
            return this.controller.states.goRight;
        } else if (this.controller.moveIntent.left) {
            return this.controller.states.goLeft;
        }

        return this.controller.states.idle;
    }
    end() { }

    playAnimation() {
        this.controller.animationDirection = `${this.controller.facing.vertical}${this.controller.facing.horizontal}` as AnimationDirection
        const newAnimation: string = `sebastian-${this.animation}-${this.controller.animationDirection}`;

        if (this.controller.sprite.anims.getName() !== newAnimation) {
            this.controller.sprite.play(newAnimation);
        }
    }
}

class Standing extends MovableRoot {
    start() {
        this.controller.sprite.setVelocity(this.speed.x, this.speed.y);
        this.playAnimation();
    }
}

class Moving extends MovableRoot {
    start() {

        if (this.speed.y < 0) {
            this.controller.facing.vertical = 'N';
        } else if (this.speed.y > 0) {
            this.controller.facing.vertical = 'S';
        } else {
            this.controller.facing.vertical = '';
        }

        // x > 0 & x < 0 share direction E, just flipped in one state
        this.controller.sprite.flipX = this.speed.x < 0;

        if (this.speed.x !== 0) {
            this.controller.facing.horizontal = 'E';
        } else {
            this.controller.facing.horizontal = '';
        }


        this.playAnimation();
    }
    update(): IState {
        // const multiplier = (this.controller.moveIntent.run ? 1.5 : 1);
        const multiplier = 1;
        this.controller.sprite.setVelocity(this.speed.x * multiplier, this.speed.y * multiplier);

        return super.update();
    }
}
