import { CST } from "../constants/CST";
import { soundFiles } from "../constants/sounds";

import sebastianAnims from './animationConfigs/sebastian.json';
import butcherAnims from './animationConfigs/butcher.json';
import { createAnimations } from "./createAnimations";

export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.LOAD,
        });
    }

    init() { }

    preload() {
        soundFiles.forEach(sound => {
            this.load.audio(sound, `assets/sound/${sound}`);
        });

        // experiment with cleating active maps texture
        this.cache.binary.getKeys();
        this.load.spritesheet("tiles", "assets/levels/tilesTop.png", { frameWidth: 128, frameHeight: 128 });
        console.log("key entries", this.cache.binary.getKeys());
        // experiment with clearing active map
        this.cache.tilemap.remove("map");
        this.load.tilemapTiledJSON("map", "assets/levels/basementTop.json");

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff,
            },
        });

        this.load.on("progress", (progress) => {
            loadingBar.clear();
            loadingBar.fillRect(
                0,
                this.game.renderer.height / 2,
                this.game.renderer.width * progress,
                50
            );
        });

        this.load.atlas('sebastian', 'assets/images/sebastian/spriteSheet.png', 'assets/images/sebastian/spriteSheet.json');
        this.load.atlas('butcher', 'assets/images/enemy/spriteSheet.png', 'assets/images/enemy/spriteSheet.json');

    }
    create() {
        createAnimations(this, 'sebastian', sebastianAnims, 'sebastian');
        createAnimations(this, 'butcher', butcherAnims, 'butcher');

        this.scene.start(CST.SCENES.START_MENU, { message: "from load scene" });
    }
    // initAllCharacterAnimations() {
    //     ['walk-NE', 'walk-N', 'walk-E', "walk-SE", "walk-S", 'idle-N', 'idle-NE', 'idle-E', 'idle-SE', 'idle-S', 'slice-N', 'slice-NE', 'slice-E', 'slice-SE', 'slice-S'].forEach((key) =>
    //         this.anims.create({
    //             key: 'enemy' + key + ".png", // texture key is same for animation key/filename - KISS
    //             frames: this.anims.generateFrameNumbers('enemy' + key + ".png"),
    //             frameRate: 8
    //         }));
    // }
}
