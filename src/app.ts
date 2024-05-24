// for map data will try to use
//labs.phaser.io/edit.html?src=src/game%20objects\tilemap\static\tiled-json-map.js
// https://labs.phaser.io/edit.html?src=src%5Cgame%20objects%5Ctilemap%5Cstatic%5Ctileset%20collision%20shapes.js
// import Phaser from "phaser/src/phaser.js";



// for lighting https://labs.phaser.io/edit.html?src=src\tilemap\light%20map.js
import Phaser from "phaser";

import { LoadScene } from "./scenes/LoadScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameSceneTop } from "./scenes/GameSceneTop";
import { GameSceneTopHudScene } from "./scenes/GameSceneTopHudScene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        antialiasGL: false,
        antialias: false,
        pixelArt: true,
        // roundPixels: true
    },
    physics: {
        default: "matter",
        matter: {
            // enableSleeping: true,
            // debug: true,
            gravity: { x: 0, y: 0 },
        }

    },
    scene: [LoadScene, MenuScene, GameSceneTop, GameSceneTopHudScene],
};

new Phaser.Game(config);
