// https://www.emanueleferonato.com/2019/01/23/html5-endless-runner-built-with-phaser-and-arcade-physics-step-5-adding-deadly-fire-being-kind-with-players-by-setting-its-body-smaller-than-the-image/

// animating tiles here
// https://medium.com/@junhongwang/tiled-generated-map-with-phaser-3-d2c16ffe75b6
import { CST } from "../constants/CST";

import { AnimatedTileSceneBase } from "../levelComponents/AnimatedTileSceneBase";
// import { NavMesh } from "~/levelComponents/NavMesh";
import jsonLogic from '../jsonLogic';
import { Character, PlayerControlls, ButcherControlls } from './Character';

type GameDialogue = {
    rulePre?: Record<string, unknown>;
    rulePreFail?: GameDialogue;
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

    changeTileGameObjectToId?: number;
    tween?: Record<string, unknown> & {
        ids: string[]
    }
};

export class GameScene extends AnimatedTileSceneBase {

    // navMesh!: NavMesh;

    graphics: Phaser.GameObjects.Graphics;
    // controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    visualLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    tileHalfHeight: number;
    character: Character;
    characterEnemy: Character;
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

        this.events.on('characterDeath', this.onCharacterDeath, this);
    }

    onCharacterDeath(character: Character) {
        console.log("KILLL CHARACTER", character.imageFramePrefix);
        const bloodTileIndexInTilemap = 24;
        const x = character.sprite.x;
        const y = character.sprite.y;
        const bloodTile = this.add.image(x, y, 'tiles', bloodTileIndexInTilemap)
            .setDepth(y - 5)
            .setOrigin(0.5, 0.5)
            .setScale(0)
            .setTint(0xff0000);


        // https://labs.phaser.io/edit.html?src=src\tweens\tween%20text%20size.js
        this.tweens.addCounter({
            from: 0,
            to: 0.5,
            duration: 2000,
            yoyo: false,
            onUpdate: (tween) => {
                const v = tween.getValue();
                bloodTile.setScale(v);
                this.cameras.main.setZoom(1 + v / 2);
            }
        });
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
    processGameDialogue(d: GameDialogue, gameObject: Phaser.Physics.Matter.Image, receiver: Phaser.GameObjects.GameObject): boolean {
        const { player, enemy, enemySpeed, enemyIdle, enemyCanChase, newDialogue, rulePre, rulePost, playerTexture, playerMoveAnim } = d;

        if (rulePre) {
            console.log('RYYYYLE', rulePre);
            const res = jsonLogic.apply(rulePre, this.blackboard);
            if (!res) {

                console.log(":::PREEEE:>>>", res);
                if (d.rulePreFail) {
                    return this.processGameDialogue(d.rulePreFail, gameObject, receiver);
                }
                return false;
            }
        }

        if (receiver && d.actor) {
            if (d.actor.events) {
                console.log('WHHHHHAAAAT?', d.actor);
                d.actor.events.forEach(({ name, value }) => {
                    receiver.emit(name, value);
                });
            }
        }

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
            const { sprite } = this.character;
            this.characterEnemy.sprite.emit('chase', !!enemyCanChase, sprite.x, sprite.y, sprite);
        }
        if (playerTexture) {
            this.character.imageFramePrefix = playerTexture;
        }

        if (playerMoveAnim) {
            this.character.moveAnim = playerMoveAnim;
        }

        if (gameObject?.body && d.changeTileGameObjectToId !== undefined) {
            ((gameObject.body as MatterJS.BodyType).parts ?? []).forEach((p) => {
                this.matter.world.remove(p);
            });

            gameObject.setFrame(d.changeTileGameObjectToId);
        }

        if (d.tween) {
            const { ids, ...tween } = d.tween;

            const gameObjects = (ids || []).map((id) => {
                return this.children.getByName(id);
            }).filter((o) => o !== null);

            console.log("====woooooo", ids, gameObjects);
            if (gameObjects.length > 0) {
                this.tweens.add({
                    targets: gameObjects,
                    ...tween,
                    ease: 'Sine.easeInOut',
                    delay: this.tweens.stagger(500)
                });
            }
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
        this.matter.world.on('collisionstart', (event, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
            const isPlayerHere = [bodyA.label, bodyB.label].some(l => l === 'player');
            if (!isPlayerHere) {
                return
            }

            const dialogue = (bodyA.dialogue ?? bodyB.dialogue) as GameDialogue;
            let trigger: MatterJS.BodyType = null;

            let actor = null;
            if (bodyA.dialogue) {
                trigger = bodyA;
                actor = bodyB;
            }
            if (bodyB.dialogue) {
                trigger = bodyB;
                actor = bodyA;
            }

            if (!trigger) {
                return;
            }

            if (dialogue) {
                const wasProcessed = this.processGameDialogue(dialogue, trigger?.gameObject as Phaser.Physics.Matter.Image, actor?.gameObject);
                if (wasProcessed) {
                    if (dialogue.removeTrigger) {
                        this.matter.world.remove(trigger);
                        return;
                    }
                }
            }

            if (trigger.isSensor) {
                Phaser.Physics.Matter.Matter.Sleeping.set(trigger, true);
            }
        });
    }

    addLevelFloorAndLights() {

        this.map = this.add.tilemap("map");
        //
        // // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // // of the tileset image used when loading the file in preload.
        this.tileset = this.map.addTilesetImage(
            "tilesTop",
            "tiles"
        );


        this.map.layers.forEach((l, layerIndex) => {
            const hasTileCollisions = l.properties.find(({ name, value }) => {
                return name === 'physics' && value === true;
            });

            this.map.forEachTile((t) => {
                if (t.index > -1) {
                    let depth = t.pixelY;
                    if (t.properties.wall) {
                        depth += t.height - 10;
                    }
                    if (t.properties.above) {
                        depth += t.height * 2;
                    }
                    this.add.image(t.pixelX, t.pixelY, 'tiles', t.index - 1)
                        .setDepth(
                            depth
                        )
                        .setOrigin(0, 0)
                        .setPipeline('Light2D');

                    if (hasTileCollisions) {
                        this.makeTileCollision(t);
                    }
                }

            }, undefined, undefined, undefined, undefined, undefined, undefined, l.name);
        });


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



        this.character = new Character(this, 400, 300, 'walk-NE.png', 'player');
        this.character.controller = new PlayerControlls(this, this.character)

        this.characterEnemy = new Character(this, 400, 300, 'slice-NE.png', 'enemy');

        this.characterEnemy.controller = new ButcherControlls(this, this.characterEnemy);

        this.characterEnemy.lastDirection.x = 1;
        this.characterEnemy.lastDirection.y = -1;

        this.characterEnemy.defaultAnimation = 'slice';
        this.characterEnemy.moveAnim = 'walk';


        this.characterEnemy.myLight.intensity = 0.3;

        this.cameras.main.fadeIn(2000, 0, 0, 0);


        this.cameras.main.setZoom(0.5);
        this.cameras.main.startFollow(this.character.sprite, true, 0.2, 0.2, 350, -this.cameras.main.height / 2);
        this.cameras.main.zoomTo(1);
        // ---------
        this.map.getObjectLayerNames().forEach(n => {
            if (n === 'lights') {
                this.map.getObjectLayer(n)?.objects.forEach(o => {
                    const pp = o;

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
                    const blackboard = currLayer.properties.find(({ name }) => name === 'blackboard')

                    this.blackboard = JSON.parse(blackboard.value);
                }

                currLayer.objects.forEach(o => {
                    const pp = o;

                    if (o.name === 'start') {
                        this.character.sprite.x = pp.x;
                        this.character.sprite.y = pp.y;

                        this.cameras.main.centerOn(pp.x, pp.y);
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
                        const onEnterEvent = o.properties.find(({ name }) => name === 'onEnter');

                        if (onEnterEvent?.value) {
                            physicsOptions.dialogue = JSON.parse(onEnterEvent.value);
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

                console.log("objects in ", n, objects);

                objects.forEach((t) => {
                    // const smartTile = this.matter.add.image(t.x, t.y - t.height, 'tiles', t.gid - 1)

                    const smartTile = (new SpriteWithDepth(this, t.x, t.y - t.height, 'tiles', t.gid - 1))
                        .setDepth(
                            t.y
                        )
                        .setOrigin(0, 0)
                        .setPipeline('Light2D')
                        .setName(t.id.toString());
                    console.log("----ID", t.id.toString());

                    // console.log('-----props', t);

                    const tileCollision = this.makeTileCollision({
                        index: t.gid,
                        pixelX: 0,
                        pixelY: 0,
                        allowStatic: false
                    }, t.properties);

                    if (!tileCollision) return;

                    const { bodyParts: compoundBodyParts, kinematic, tween, radius, dialogue } = tileCollision;

                    if (!kinematic && compoundBodyParts.length > 0) {
                        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
                            parts: compoundBodyParts,
                            inertia: Infinity
                        });

                        smartTile.setExistingBody(compoundBody, true);
                        smartTile.setStatic(true);
                        smartTile.setPosition(t.x + t.width / 2, t.y);
                        // Phaser.Physics.Matter.Matter.Body.scale(smartTile.body, 0.5, 0.5)
                    }
                    else {
                        smartTile.setCircle(radius, { dialogue });
                        // smartTile.body.dialogue = dialogue;
                        smartTile.setFixedRotation();
                        smartTile.setMass(100);
                        smartTile.setFrictionAir(1);
                        smartTile.setOrigin(0.5, 0.5);
                        smartTile.setPosition(t.x + t.width / 2, t.y - t.height / 2);

                        if (tween) {
                            this.tweens.add({
                                targets: smartTile,
                                ...tween
                            });
                        }
                    }

                });
            }
        });
    }

    makeTileCollision(tile: {
        index: number,
        pixelX: number,
        pixelY: number
        allowStatic: boolean
    }, objectProps: { name: string, value: string | boolean }[] = []): { dialogue: Record<string, unknown>, bodyParts: MatterJS.BodyType[], kinematic: boolean, radius: number, tween?: Record<string, unknown> } | null {
        const tileWorldPos = tile;
        const collisionGroup = this.tileset.getTileCollisionGroup(tile.index);
        if (!collisionGroup || collisionGroup.objects.length === 0) { return null; }

        if (collisionGroup.properties && collisionGroup.properties.isInteractive) {
        }
        else {
        }

        const bodyParts: MatterJS.BodyType[] = [];
        // The group will have an array of objects - these are the individual collision shapes
        const objects = collisionGroup.objects;

        let kinematic = false;
        let radius = 30; // default for kinematic object
        let objectTween: Record<string, unknown> | undefined = undefined;
        let dialogue = {};
        console.log("-----------", tile.index, collisionGroup);

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const props: { name: string, value: string | boolean }[] = object.properties ?? [];

            const isSensor = props.some(({ name }) =>
                name === 'sensor'
            );

            const isKinematic = props.some(({ name }) =>
                name === 'isKinematic'
            );

            const tween = props.find(({ name }) => name === 'tween');
            if (tween) {
                objectTween = JSON.parse(tween.value as string);
            }

            const kinematicRadius = props.find(({ name }) => name === 'radius');
            if (kinematicRadius) {
                radius = JSON.parse(kinematicRadius.value as number);
            }

            console.log("==========KINEMATIC", isKinematic);
            if (isKinematic) {
                kinematic = true;
            }

            const physicsOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {
                ignoreGravity: true
            };
            if (tile.allowStatic === undefined || tile.allowStatic === true) {
                physicsOptions.isStatic = true;
            }

            const onEnterEvent = props.find(({ name }) => name === 'onEnter');

            const onEnterEventFromMainObject = objectProps.find(({ name }) => name === 'onEnter');

            if (onEnterEvent?.value) {
                dialogue = {
                    ...dialogue,
                    ...JSON.parse(onEnterEvent.value as string),
                    ...JSON.parse(onEnterEventFromMainObject?.value as string ?? "{}")

                };
            }

            if (isSensor) {
                physicsOptions.isSensor = true;

                if (onEnterEvent?.value) {
                    physicsOptions.dialogue = {
                        ...JSON.parse(onEnterEvent.value as string),
                        ...JSON.parse(onEnterEventFromMainObject.value as string)
                    };
                }
            }

            const objectX = tileWorldPos.pixelX + object.x;
            const objectY = tileWorldPos.pixelY + object.y;

            // When objects are parsed by Phaser, they will be guaranteed to have one of the
            // following properties if they are a rectangle/ellipse/polygon/polyline.
            if (object.polygon || object.polyline) {
                const originalPoints = (object.polygon ? object.polygon : object.polyline);
                const visualPoints = [];

                for (let j = 0; j < originalPoints.length; j++) {
                    const point = originalPoints[j];
                    const pPos = point;

                    visualPoints.push({
                        x: objectX + pPos.x,
                        y: objectY + pPos.y
                    });
                }

                const c = this.matter.verts.centre(visualPoints);
                const body = this.matter.add.fromVertices(c.x, c.y, visualPoints, { ...physicsOptions });
                bodyParts.push(body);
            }
        }

        return {
            bodyParts,
            kinematic,
            tween: objectTween,
            radius,
            dialogue
        };
    }

    update(time: number, delta: number) {
        this.character.update();
        this.characterEnemy.update();
    }
}

class SpriteWithDepth extends Phaser.Physics.Matter.Sprite {
    constructor(scene: Phaser.Scene, x, y, texture, frame) {
        super(scene.matter.world, x, y, texture, frame);
        this.setTexture(texture);
        scene.add.existing(this);

        this.setFrame(frame);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta)
        this.setDepth(this.y + 1);
    }
}
