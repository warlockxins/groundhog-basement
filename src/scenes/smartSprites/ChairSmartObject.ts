import { GameSceneTopPossibilities } from "../GameSceneTopInterface";
import { SpriteWithDepth } from "./SpriteWithDepth";

export class ChairSmartObject extends SpriteWithDepth {

    timeLoud = 0;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame: number,
    ) {
        super(scene, x, y, texture, frame);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        let velocity = this.getVelocity();
        let speedSquared = velocity.x * velocity.x + velocity.y * velocity.y;

        // console.log(speedSquared);
        if (speedSquared > 0.0001) {
            this.timeLoud += delta;

            if (this.timeLoud > 50) {
                console.log('chair loud', speedSquared, velocity);

                const soundToPlay = (this.scene as Phaser.Scene & GameSceneTopPossibilities).sounds['slamDoor'];
                if (!soundToPlay.isPlaying) {
                    soundToPlay.play({ loop: false }); // Note - change to different later
                }

                this.timeLoud = 0;
            }
        } else {
            this.timeLoud = 0;
        }
    }
}