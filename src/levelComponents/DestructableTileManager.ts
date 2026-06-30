import { DestructableTile } from "./DestructableTile";

const COIN_BOX = 3;
const WOODEN_CRATE = 2;

const DESTRUCTABLE_IDS = [
    COIN_BOX,
    WOODEN_CRATE
]

const conBoxFrame = 'coin box';
const woodenCrateBox = 'wooden crate';

const animationFrames = {
    [COIN_BOX]: conBoxFrame,
    [WOODEN_CRATE]: woodenCrateBox
}

const destructableId = 'destructableId';


export class DestructableTileManager {
    private tiles: Map<string, DestructableTile> = new Map();
    private group: Phaser.GameObjects.Group;
    private scene: Phaser.Scene;

    constructor(tilemap: Phaser.Tilemaps.Tilemap, tileLayer: Phaser.Tilemaps.DynamicTilemapLayer, textureName: string, scene: Phaser.Scene) {
        this.scene = scene;
        const destructableTiles = tilemap.filterTiles((tile: Phaser.Tilemaps.Tile) => {
            return DESTRUCTABLE_IDS.includes(tile.index);
        }, undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true }, tileLayer);

        destructableTiles.forEach((tile) => {
            this.add(tile);
        });

        const tileTexture: Phaser.Textures.Texture = scene.textures.list["tiles"];
        tileTexture.add(textureName, 0, 60, 0, 30, 30);
        tileTexture.add(woodenCrateBox, 0, 30, 0, 30, 30);

        this.group = scene.add.group({
            defaultKey: textureName,
            defaultFrame: conBoxFrame,
            maxSize: 10,
            createCallback: (block) => {
                block.setOrigin(0, 0);
                block.setDataEnabled();
                block.data.set('tweenIndex', this.group.getLength() - 1);
            },
            removeCallback: function (alien) {
                console.log('Removed', alien.name);
            }
        });
    }

    tileKey(tile: Phaser.Tilemaps.Tile): string {
        return `${tile.x}_${tile.y}`;
    }

    add(tile: Phaser.Tilemaps.Tile) {
        this.tiles.set(this.tileKey(tile),
            new DestructableTile(
                tile
            ));
    }

    trigger(tile: Phaser.Tilemaps.Tile): boolean {
        const id = this.tileKey(tile);
        const destructable = this.tiles.get(id);

        if (!destructable) {
            return false;
        }

        // still playing animation, or destroyed
        if (destructable.tweenIndex !== -1 || destructable.lives <= 0) {
            return false;
        }

        // now block logic
        destructable.hit(1);
        if (destructable.lives <= 0) {
            this.tiles.delete(id);
            return true;
        }
        //

        const sprite = this.group.get(tile.pixelX, tile.pixelY);
        if (!sprite) {
            return false;
        }

        tile.setVisible(false);

        sprite
            .setActive(true)
            .setVisible(true)
            .setFrame(
                animationFrames[tile.index]
            )


        this.scene.tweens.add({
            targets: sprite,
            y: '-=5',
            duration: 200,
            ease: 'Power3',
            paused: true,
            yoyo: true,
            onComplete: (_tweenGone: Phaser.Tweens.Tween, blockItem) => {
                tile.setVisible(true);
                const item = blockItem[0];
                const destructableObjectId = item.data.get(destructableId);
                const desroyedObject = this.tiles.get(destructableObjectId);
                if (desroyedObject) {
                    desroyedObject.tweenIndex = -1;
                }
                this.group.killAndHide(item);
                this.scene.tweens.remove(_tweenGone);
            }
        }).play();

        const spriteIndex = sprite.data.get('tweenIndex');
        sprite.data.set(destructableId, id);
        destructable.tweenIndex = spriteIndex;

        return false;
    }
}