import { Character } from "../Character";
import { GameSceneTopPossibilities } from "../GameSceneTopInterface";

export class LightSanityChecker {
    character: Character;
    sprite: Phaser.Physics.Matter.Sprite;
    scene: Phaser.Scene & GameSceneTopPossibilities;
    sanityScore: number;
    sanityCheckTimer!: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene & GameSceneTopPossibilities, character: Character) {
        this.scene = scene;
        this.character = character;
        this.sprite = character.sprite;
        this.sanityScore = 10;

        if (this.sanityCheckTimer) {
            this.scene.time.removeEvent(this.sanityCheckTimer);
        }

        this.sanityCheckTimer = new Phaser.Time.TimerEvent({
            delay: 1000,
            loop: true,
            callback: this.checkSanityBasedOnDistanceToClosestLight,
            callbackScope: this
        });


        this.scene.time.addEvent(this.sanityCheckTimer);
    }

    checkSanityBasedOnDistanceToClosestLight() {
        const { x, y } = this.sprite;

        const closestLightId = this.scene.findClosestLight({ x, y });

        if (closestLightId) {
            this.sanityScore += 1.5;

            this.sanityScore = Math.min(this.sanityScore, 10);
        } else {
            this.sanityScore -= 1;

            if (this.sanityScore < 5 && this.sanityScore > 2) {
                this.character.bark('So dark!');
            }
            if (this.sanityScore < 0) {
                this.character.onMadeInsane();

                this.scene.time.removeEvent(this.sanityCheckTimer);
            }
            this.sanityScore = Math.max(this.sanityScore, 0);
        }

        this.scene.registry.set('sanity', this.sanityScore);
    }
}