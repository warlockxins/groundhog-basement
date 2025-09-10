import { Scene } from "phaser";
import { AnimationConfig } from "./types";
import { AnimationAvaliableDirections } from "./AnimationDirection";
// import { AnimationAvaliableDirections, AnimationConfig } from "./AnimationDirection";

export function createAnimations(scene: Scene, characterName: string, animConfig: AnimationConfig, spriteSheetName: string) {

    // walk, run, idle, death, walkCrouch, armActionTake
    const baseAnimationKeys = Object.keys(animConfig);

    const animationNames: string[] = [];

    AnimationAvaliableDirections.forEach((direction) => {
        baseAnimationKeys.forEach((baseAnimation) => {

            const frames = animConfig[baseAnimation][direction].map((f) => ({
                key: spriteSheetName,
                frame: f,
            }));

            const animationNameWithDirection = `${characterName}-${baseAnimation}-${direction}`;

            scene.anims.create({
                key: animationNameWithDirection,
                frames: frames,
                frameRate: 10,//frames.length,
                repeat: -1,
            });

            animationNames.push(animationNameWithDirection);
        });
    });
}