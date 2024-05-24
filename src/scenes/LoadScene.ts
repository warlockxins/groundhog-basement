import { CST } from "../constants/CST";

const playerAnimationFiles = [
    "armActionTake-E.png",
    "armActionTake-N.png",
    "armActionTake-NE.png",
    "armActionTake-S.png",
    "armActionTake-SE.png",
    "idle-E.png",
    "idle-N.png",
    "idle-NE.png",
    "idle-S.png",
    "idle-SE.png",
    "run-E.png",
    "run-N.png",
    "run-NE.png",
    "run-S.png",
    "run-SE.png",
    "walk-E.png",
    "walk-N.png",
    "walk-NE.png",
    "walk-S.png",
    "walk-SE.png",
    "walkCrouch-E.png",
    "walkCrouch-N.png",
    "walkCrouch-NE.png",
    "walkCrouch-S.png",
    "death-N.png",
    "death-NE.png",
    "death-E.png",
    "death-SE.png",
    "death-S.png"
];

const enemyAnimationFiles = [
    "idle-E.png",
    "idle-N.png",
    "idle-NE.png",
    "idle-S.png",
    "idle-SE.png",
    "walk-E.png",
    "walk-N.png",
    "walk-NE.png",
    "walk-S.png",
    "walk-SE.png",
    "slice-E.png",
    "slice-N.png",
    "slice-NE.png",
    "slice-S.png",
    "slice-SE.png"
];

export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.LOAD,
        });
    }

    init() { }

    preload() {
        playerAnimationFiles.forEach((file) => {
            this.load.spritesheet('player' + file, `assets/images/player/${file}`, { frameWidth: 128, frameHeight: 128 });
        });

        enemyAnimationFiles.forEach((file) => {
            this.load.spritesheet('enemy' + file, `assets/images/enemy/${file}`, { frameWidth: 128, frameHeight: 128 });
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
    }
    create() {
        this.initAllCharacterAnimations();
        this.scene.start(CST.SCENES.START_MENU, { message: "from load scene" });
    }

    initAllCharacterAnimations() {
        ['walk-NE', 'walk-N', 'walk-E', "walk-SE", "walk-S", "run-N", "run-NE", "run-E", "run-SE", "run-S", 'idle-N', 'idle-NE', 'idle-E', 'idle-SE', 'idle-S', 'death-N', 'death-NE', 'death-E', 'death-SE', 'death-S'].forEach((key) =>
            this.anims.create({
                key: 'player' + key + ".png", // texture key is same for animation key/filename - KISS
                frames: this.anims.generateFrameNumbers('player' + key + ".png"),
                frameRate: 8
            }));

        ['walk-NE', 'walk-N', 'walk-E', "walk-SE", "walk-S", 'idle-N', 'idle-NE', 'idle-E', 'idle-SE', 'idle-S', 'slice-N', 'slice-NE', 'slice-E', 'slice-SE', 'slice-S'].forEach((key) =>
            this.anims.create({
                key: 'enemy' + key + ".png", // texture key is same for animation key/filename - KISS
                frames: this.anims.generateFrameNumbers('enemy' + key + ".png"),
                frameRate: 8
            }));
    }
}
