// https://www.emanueleferonato.com/2019/01/23/html5-endless-runner-built-with-phaser-and-arcade-physics-step-5-adding-deadly-fire-being-kind-with-players-by-setting-its-body-smaller-than-the-image/

// animating tiles here
// https://medium.com/@junhongwang/tiled-generated-map-with-phaser-3-d2c16ffe75b6

import { AnimatedTile, TilesetTileData } from '../levelComponents/AnimatedTile';

export class AnimatedTileSceneBase extends Phaser.Scene {
    map!: Phaser.Tilemaps.Tilemap;

    private animatedTiles: AnimatedTile[] = [];
    tileset!: Phaser.Tilemaps.Tileset;

    createAnimatedTiles() {
        if (!this.tileset) {
            return;
        }

        const tileData = this.tileset.tileData as TilesetTileData;

        for (let tileid in tileData) {
            this.map.layers.forEach(layer => {
                if (layer.tilemapLayer.type === "DynamicTilemapLayer") {
                    layer.data.forEach(tileRow => {
                        this.makeAnimationForRow(tileRow, tileid);
                    });
                }
            });
        };
    }

    makeAnimationForRow(tileRow: Phaser.Tilemaps.Tile[], tileid: string) {
        tileRow.forEach(tile => {
            if (tile.index - this.tileset.firstgid === parseInt(tileid, 10)) {
                this.animatedTiles.push(
                    new AnimatedTile(
                        tile,
                        this.tileset.tileData[tileid].animation,
                        this.tileset.firstgid
                    )
                );
            }
        });
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.animatedTiles.forEach(tile => tile.update(delta));
    }
}
