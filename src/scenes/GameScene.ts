// https://www.emanueleferonato.com/2019/01/23/html5-endless-runner-built-with-phaser-and-arcade-physics-step-5-adding-deadly-fire-being-kind-with-players-by-setting-its-body-smaller-than-the-image/

// animating tiles here
// https://medium.com/@junhongwang/tiled-generated-map-with-phaser-3-d2c16ffe75b6
import { CST } from "../constants/CST";

import { AnimatedTileSceneBase } from "../levelComponents/AnimatedTileSceneBase";
// import { NavMesh } from "~/levelComponents/NavMesh";
import jsonLogic from '../jsonLogic';

type GameDialogue = {
    rulePre?: Record<string, unknown>;
    rulePost?: Record<string, unknown>;
    player?: string;
    playerTexture?: string;
    playerMoveAnim?: string;
    enemy?: string;
    enemySpeed?: {
        x: number, y: number;
    }
    enemyIdle?: string;
    enemyCanChase?: boolean;
    removeTrigger: boolean;
    newDialogue?: GameDialogue[];
};

export class GameScene extends AnimatedTileSceneBase {

    // navMesh!: NavMesh;

    graphics: Phaser.GameObjects.Graphics;
    // controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    visualLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    tileHalfHeight: number;
    character: Character;
    characterEnemy: Character;
    enemyCanChase: boolean;
    scriptedDialogs: GameDialogue[];

    blackboard: Record<string, unknown> = {};
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({
            key: CST.SCENES.GAME,
        });
    }

    init(data) {
        console.log("data passed to this scene", data);
    }

    preload() {
    }

    create() {
        this.addLevelFloorAndLights();

        // this.createAnimatedTiles();
        this.cameras.main.setOrigin(0.1, 1);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.lights.enable().setAmbientColor(0x333333);

        this.scriptedDialogs = [];

        jsonLogic.rm_operation('setVar');
        jsonLogic.add_operation('setVar', this.jsLogicSetBlackboardVar.bind(this));
        this.addPhysicsListeners();
    }

    jsLogicSetBlackboardVar(key: string, value: unknown) {

        console.log('>>>>>MMM>>>', key, '|', value);
        if (!key) {
            return;
        }
        this.blackboard[key] = value;
    }

    /**
    * @returns boolean if dialogue was not processed due to rule Precondition then returns false  
    **/
    processGameDialogue(d: GameDialogue): boolean {
        const { player, enemy, enemySpeed, enemyIdle, enemyCanChase, newDialogue, rulePre, rulePost, playerTexture, playerMoveAnim } = d;

        if (rulePre) {
            console.log('RYYYYLE', rulePre);
            const res = jsonLogic.apply(rulePre, this.blackboard);
            if (!res) {

                console.log(":::PREEEE:>>>", res);
                return false;
            }
        }

        console.log('WHHHHHAAAAT?', rulePre);

        this.character.textBubble.setText(player ?? '');

        this.characterEnemy.textBubble.setText(enemy ?? '');
        if (enemySpeed) {
            this.characterEnemy.lastDirection.x = enemySpeed.x;
            this.characterEnemy.lastDirection.y = enemySpeed.y;
        }
        if (enemyIdle) {
            this.characterEnemy.defaultAnimation = enemyIdle;
        }

        if (enemyCanChase !== undefined) {
            this.enemyCanChase = !!enemyCanChase;
        }
        if (playerTexture) {
            this.character.imageFramePrefix = playerTexture;
        }

        if (playerMoveAnim) {
            this.character.moveAnim = playerMoveAnim;
        }


        if (rulePost) {
            console.log('RYYYYLE POOOOST', rulePost);
            const res = jsonLogic.apply(rulePost, this.blackboard);
            console.log(":::Pooooooost:>>>", res);
        }

        this.time.delayedCall(2500, () => {
            this.character.textBubble.setText('');

            this.characterEnemy.textBubble.setText('');

            if (newDialogue) {
                this.scriptedDialogs = newDialogue;
            }

            const nextDialogueItem = this.scriptedDialogs.shift();
            if (nextDialogueItem) {
                this.processGameDialogue(nextDialogueItem);
            }
        }, [], this);

        return true;
    }

    getLogicObject(key: string) {
        return this.map.getObjectLayer("logic")
            .objects.find(
                (item) => item.name === key);
    }

    addPhysicsListeners() {
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            const isPlayerHere = [bodyA.label, bodyB.label].some(l => l === 'player');
            if (!isPlayerHere) {
                return
            }

            const dialogue = (bodyA.dialogue ?? bodyB.dialogue) as GameDialogue;
            let trigger: MatterJS.BodyType = null;
            if (bodyA.dialogue) {
                trigger = bodyA;
            }
            if (bodyB.dialogue) {
                trigger = bodyB;
            }

            console.log(dialogue);
            if (dialogue) {
                const wasProcessed = this.processGameDialogue(dialogue);
                if (wasProcessed && dialogue.removeTrigger) {
                    this.matter.world.remove(trigger);
                }

            }
        });
    }

    addLevelFloorAndLights() {

        this.map = this.add.tilemap("map");
        //
        // // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // // of the tileset image used when loading the file in preload.
        this.tileset = this.map.addTilesetImage(
            "tiles",
            "tiles"
        );

        this.map.layers.forEach((l, layerIndex) => {
            const isPlainLayer = l.properties.find(({ name, value }) => {
                return name === 'staticLayer' && value === true;
            });

            const hasTileCollisions = l.properties.find(({ name, value }) => {
                return name === 'physics' && value === true;
            });

            if (isPlainLayer) {
                const floorLayer = this.map.createLayer(l.name, 'tiles');
                if (floorLayer) {
                    this.visualLayers.push(floorLayer);
                    // floorLayer.setPipeline('Light2D');
                }
            }

            this.map.forEachTile((t) => {
                if (t.index > -1) {
                    let depth = this.depthForXY(t.pixelX, t.pixelY);
                    if (t.properties.wall) {
                        depth += 1;
                    }
                    if (!isPlainLayer) {
                        this.add.image(t.pixelX, t.pixelY, 'tiles', t.index - 1)
                            .setDepth(
                                depth
                            )
                            .setOrigin(0, 0)
                        // .setPipeline('Light2D');
                    }
                    if (hasTileCollisions) {
                        this.makeTileCollision(t);
                    }
                }
                // lll.setPipeline('Light2D')
                //             .setDepth(row * 100 + layerIndex)

            }, undefined, undefined, undefined, undefined, undefined, undefined, l.name);
        });


        ['walk-NE', 'walk-N', 'walk-E', "walk-SE", "walk-S", "run-N", "run-NE", "run-E", "run-SE", "run-S", 'idle-N', 'idle-NE', 'idle-E', 'idle-SE', 'idle-S'].forEach((key) =>
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



        this.character = new Character(this, 400, 300, 'walk-NE.png', 'player');

        this.characterEnemy = new Character(this, 400, 300, 'slice-NE.png', 'enemy');

        this.characterEnemy.lastDirection.x = 1;
        this.characterEnemy.lastDirection.y = -1;

        this.characterEnemy.defaultAnimation = 'slice';
        this.characterEnemy.moveAnim = 'walk';


        this.characterEnemy.myLight.intensity = 0.3;

        this.cameras.main.fadeIn(2000, 0, 0, 0);


        // ---------

        const { tileWidth, tileHeight } = this.map;
        this.map.getObjectLayerNames().forEach(n => {
            if (n === 'lights') {
                this.map.getObjectLayer(n)?.objects.forEach(o => {
                    const pp = this.visualLayers[0].tileToWorldXY(o.x / 64, o.y / 64);
                    pp.add({ x: tileWidth / 2, y: tileWidth / 2 });

                    this.lights.addLight(
                        pp.x,
                        pp.y,
                        o.width ? o.width : 300
                    ).setColor(0xffff00)
                        .setIntensity(3.0);

                });
            } else if (n === 'logic') {
                const currLayer = this.map.getObjectLayer(n);
                if (!currLayer) {
                    return
                }
                if (currLayer.properties) {
                    // this.blackboard = JSON.parse();
                    const blackboard = currLayer.properties.find(({ name }) => name === 'blackboard')

                    this.blackboard = JSON.parse(blackboard.value);

                }


                currLayer.objects.forEach(o => {
                    const pp = this.visualLayers[0].tileToWorldXY(o.x / 64, o.y / 64);
                    // pp.add({ x: tileWidth / 2, y: tileHeight / 2 });

                    if (o.name === 'start') {
                        this.character.sprite.x = pp.x;
                        this.character.sprite.y = pp.y;
                    }
                    if (o.name === 'enemyStart') {
                        this.characterEnemy.sprite.x = pp.x;
                        this.characterEnemy.sprite.y = pp.y - 50;
                    }

                    const isSensor = o.properties?.some(({ name }) => {
                        return name === 'sensor'
                    });
                    if (isSensor) {
                        const physicsOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {};
                        physicsOptions.isSensor = true;
                        // physicsOptions.on
                        const onEnterEvent = o.properties.find(({ name }) => name === 'onEnter');

                        if (onEnterEvent?.value) {
                            physicsOptions.dialogue = JSON.parse(onEnterEvent.value);
                            // console.log('=====<<<<<<<', onEnterEvent, o);
                            this.matter.add.circle(
                                pp.x, pp.y, o.width ?? 30,
                                { ignoreGravity: true, isStatic: true, ...physicsOptions }
                            );
                        }
                    }
                });

            }
            else if (n === 'tileLogic') {

                type CustomTileObjectProperty = {
                    value: unknown;
                    name: string;
                    type: string;
                }

                type CustomTileObject = {
                    flippedAntiDiagonal: boolean;
                    flippedHorizontal: boolean;
                    flippedVertical: boolean;
                    gid: number;
                    height: number;
                    id: number;
                    name: string;
                    rotation: number;
                    type: string;
                    visible: boolean;
                    width: number;
                    x: number;
                    y: number;
                    properties: CustomTileObjectProperty[];

                };
                const objects: CustomTileObject[] = (this.map.getObjectLayer(n)?.objects ?? []) as unknown as CustomTileObject[];
                const layerIndex = 0; // this will be rearranged later to use shared indexed for all layers

                objects.forEach((t) => {

                    const pp = this.visualLayers[0].tileToWorldXY(t.x / 64, t.y / 64);
                    let depth = this.depthForXY(pp.x, pp.y);
                    this.add.image(pp.x, pp.y - t.height / 2, 'tiles', t.gid - 1)
                        .setDepth(
                            depth
                        )
                        .setOrigin(0, 0)
                        .setPipeline('Light2D');

                    // const depthKey = `${pp.x}-${pp.y}`;
                    //
                    // if (hasTileCollisions) {
                    //     this.makeTileCollision(t);
                    // }

                });

                console.log(">>>>", objects);
            }
        });
    }

    depthForXY(worldX: number, worldY: number) {
        // return  y * 10000 + x;
        const tileHeight = 64;
        const tileWidth = 128;
        var y = ((worldY / (tileHeight / 2) - worldX / (tileWidth / 2)) / 2);

        return y;
    }

    makeTileCollision(tile: Phaser.Tilemaps.Tile) {
        // if (tile?.index !== 15) {
        //     return;
        // }
        const layer = this.visualLayers[0];

        if (!layer) {
            return;
        }


        const tileWorldPos = layer.tileToWorldXY(tile.x, tile.y);
        const collisionGroup = this.tileset.getTileCollisionGroup(tile.index);
        if (!collisionGroup || collisionGroup.objects.length === 0) { return; }
        // You can assign custom properties to the whole collision object layer (or even to
        // individual objects within the layer). Here, use a custom property to change the color of
        // the stroke.
        if (collisionGroup.properties && collisionGroup.properties.isInteractive) {
        }
        else {
        }

        // The group will have an array of objects - these are the individual collision shapes
        const objects = collisionGroup.objects;

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];

            const props: { name: string, value: string | boolean }[] = object.properties ?? [];
            const isSensor = props.some(({ name }) => {
                return name === 'sensor'
            });

            const physicsOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {};

            if (isSensor) {
                physicsOptions.isSensor = true;
                // physicsOptions.on
                const onEnterEvent = props.find(({ name }) => name === 'onEnter');

                if (onEnterEvent?.value) {
                    physicsOptions.dialogue = JSON.parse(onEnterEvent.value);
                }
            }

            const objIsoPos = layer.tileToWorldXY(object.x / 64, object.y / 64);


            const objectX = tileWorldPos.x;
            const objectY = tileWorldPos.y;

            // When objects are parsed by Phaser, they will be guaranteed to have one of the
            // following properties if they are a rectangle/ellipse/polygon/polyline.
            if (object.polygon || object.polyline) {
                const originalPoints = object.polygon ? object.polygon : object.polyline;
                const visualPoints = [];
                for (let j = 0; j < originalPoints.length; j++) {
                    const point = originalPoints[j];

                    const pPos = layer.tileToWorldXY(point.x / 64, point.y / 64);

                    pPos.add(objIsoPos);

                    visualPoints.push({
                        x: objectX + pPos.x + 64,
                        y: objectY + pPos.y + 64
                    });
                }

                const c = this.matter.verts.centre(visualPoints);
                this.matter.add.fromVertices(c.x, c.y, visualPoints, { ignoreGravity: true, isStatic: true, ...physicsOptions });
            }
        }
    }

    update(time: number, delta: number) {

        if (this.enemyCanChase) {
            const dirX = this.character.sprite.x - this.characterEnemy.sprite.x;
            const dirY = this.character.sprite.y - this.characterEnemy.sprite.y;

            if (Math.abs(dirX) > 10) {
                this.characterEnemy.sprite.setVelocityX(Math.abs(dirX) / dirX);
            } else {
                this.characterEnemy.sprite.setVelocityX(0);
            }

            if (Math.abs(dirY) > 10) {
                this.characterEnemy.sprite.setVelocityY(Math.abs(dirY) / dirY);
            } else {
                this.characterEnemy.sprite.setVelocityY(0);
            }

            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            if (dist < 30) {

                this.enemyCanChase = false;
                this.characterEnemy.defaultAnimation = 'slice';
            }
        }
        else {
            this.characterEnemy.sprite.setVelocity(0);
        }
        this.character.sprite.setVelocity(0);


        let directionsPressed = false;
        if (this.cursors.left.isDown) {
            directionsPressed = true;
            this.character.sprite
                .setVelocityX(-2);
        }
        else if (this.cursors.right.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityX(2);
        }

        if (this.cursors.up.isDown) {

            directionsPressed = true;
            this.character.sprite
                .setVelocityY(-2);
        }
        else if (this.cursors.down.isDown) {

            directionsPressed = true;
            this.character.sprite
                //.setAngle(-180)
                .setVelocityY(2);
        }

        else if (!directionsPressed && this.cursors.space.isDown && this.character.imageFramePrefix === 'enemy') {
            if (this.character.defaultAnimation !== 'slice') {
                this.character.defaultAnimation = 'slice';
                this.character.sprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, () => {
                    console.log('done±');
                    this.character.sprite.removeAllListeners();
                    this.character.defaultAnimation = 'idle';
                }, this);

            }
        }

        this.character.update();
        this.characterEnemy.update();



        this.cameras.main.centerOn(this.character.sprite.x, this.character.sprite.y);

        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        worldPoint && this.visualLayers.forEach((tileLayer) => {
            if (this.input.manager.activePointer.isDown && tileLayer) {
                // const tile = tileLayer.getIsoTileAtWorldXY(worldPoint.x, worldPoint.y, false);

                // const tile = this.map.getLayer(tileLayer.name)?.tilemapLayer.getIsoTileAtWorldXY(this.player.x, this.player.y, false);
                const tile = tileLayer.getIsoTileAtWorldXY(worldPoint.x, worldPoint.y, false);
                if (tile) {
                    console.log(tile);
                }
            };
        });

        // const highDepthTile = this.getDepthAtWorldXY(this.character.sprite.x, this.character.sprite.y);
        const highDepthTile = this.depthForXY(this.character.sprite.x, this.character.sprite.y);

        if (highDepthTile) {
            this.character.sprite.setDepth(highDepthTile);
        }

        const butcherHighDepthTile = this.depthForXY(this.characterEnemy.sprite.x, this.characterEnemy.sprite.y);
        if (butcherHighDepthTile) {
            this.characterEnemy.sprite.setDepth(butcherHighDepthTile);
        }
    }

    getDepthAtWorldXY(x: number = 0, y: number = 0, skipWall: boolean = true): number {
        let highDepthTile: number = 0;
        this.visualLayers.forEach((tileLayer) => {
            const tile = tileLayer.getIsoTileAtWorldXY(x, y, false);
            if (tile) {
                // noop
            }
        });
        return highDepthTile;
    }
}

class Character {
    sprite: Phaser.Physics.Matter.Sprite;
    textBubble: Phaser.GameObjects.Text;
    lastDirection: Phaser.Types.Math.Vector2Like = { x: 0, y: 0 };
    myLight: Phaser.GameObjects.Light;
    imageFramePrefix: string;
    defaultAnimation: string;
    moveAnim: string;

    constructor(scene: Phaser.Scene, x: number, y: number, imageFrame: string, imageFramePrefix: string) {

        this.imageFramePrefix = imageFramePrefix;
        this.sprite = scene.matter.add.sprite(x, y, imageFramePrefix + imageFrame);

        this.sprite.play({ key: imageFramePrefix + imageFrame, repeat: -1 });
        this.sprite.setCircle(17, { label: imageFramePrefix })
            .setScale(0.9)
            .setFixedRotation()
            .setOrigin(0.5, 0.9)
            .setPipeline('Light2D');

        this.textBubble = scene.add.text(10, 10, "");
        this.textBubble.setBackgroundColor("#000000");
        this.textBubble.setAlign('center');
        this.textBubble.setMaxLines(2);


        this.myLight = scene.lights.addLight(
            x,
            y,
            100
        ).setColor(0xffffff)
            .setIntensity(1.5);


        // this.textBubble.setText("Bodies everywhere!");
        this.defaultAnimation = 'idle';
        this.moveAnim = 'run';
    }

    update() {

        const playerVelocity = this.sprite.getVelocity();

        const y = this.lastDirection.y ?? 0;
        const xAnimFrame = this.lastDirection.x !== 0 ? 'E' : '';
        const yAnimFrame = y > 0 ? 'S' : (y < 0 ? 'N' : '');
        const animDirectionFrameBase = `${yAnimFrame}${xAnimFrame}`;
        const animDirectionFrame = animDirectionFrameBase !== '' ? `-${animDirectionFrameBase}.png` : '-S.png';

        if (playerVelocity.x !== 0 || playerVelocity.y !== 0) {
            this.lastDirection = playerVelocity;
            const walkAnimFrame = `${this.imageFramePrefix}${this.moveAnim}${animDirectionFrame}`;

            this.sprite.flipX = (this.lastDirection.x ?? 0) < 0;
            this.playAnimationFrame(walkAnimFrame);
        } else {
            const moveAnim = this.defaultAnimation;
            const idleAnimFrame = `${this.imageFramePrefix}${moveAnim}${animDirectionFrame}`;
            // console.log('>>>>>>', idleAnimFrame);
            this.playAnimationFrame(idleAnimFrame);

        }

        this.textBubble.setPosition(this.sprite.x, this.sprite.y);
        this.textBubble.setDepth(this.sprite.depth + 10000);

        this.myLight.x = this.sprite.x;

        this.myLight.y = this.sprite.y - 50;


    }

    playAnimationFrame(name: string) {
        if (this.sprite.texture.key !== name) {
            this.sprite.setTexture(name);
            this.sprite.play({ key: name, repeat: -1 });
        }
    }
}
