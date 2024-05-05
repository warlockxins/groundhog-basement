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
            this.load.spritesheet('player' + file, `images/player/${file}`, { frameWidth: 128, frameHeight: 128 });
        });

        enemyAnimationFiles.forEach((file) => {
            this.load.spritesheet('enemy' + file, `images/enemy/${file}`, { frameWidth: 128, frameHeight: 128 });
        });

        // experiment with cleating active maps texture
        this.cache.binary.getKeys();
        this.load.spritesheet("tiles", "levels/tilesTop.png", { frameWidth: 128, frameHeight: 128 });
        console.log("key entries", this.cache.binary.getKeys());
        // experiment with clearing active map
        this.cache.tilemap.remove("map");
        this.load.tilemapTiledJSON("map", "levels/basementTop.json");

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff,
            },
        });

        this.load.on("progress", (progress) => {
            loadingBar.fillRect(
                0,
                this.game.renderer.height / 2,
                this.game.renderer.width * progress,
                50
            );
        });
    }
    create() {
        this.scene.start(CST.SCENES.START_MENU, { message: "from load scene" });
    }
}
