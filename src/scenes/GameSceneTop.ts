// https://www.emanueleferonato.com/2019/01/23/html5-endless-runner-built-with-phaser-and-arcade-physics-step-5-adding-deadly-fire-being-kind-with-players-by-setting-its-body-smaller-than-the-image/

// animating tiles here
// https://medium.com/@junhongwang/tiled-generated-map-with-phaser-3-d2c16ffe75b6
import { CST } from "../constants/CST";

// import { AnimatedTileSceneBase } from "../levelComponents/AnimatedTileSceneBase";
import { NavMesh, NavMeshPoint, NavMeshPointMap } from "~/levelComponents/NavMesh";
import jsonLogic from '../jsonLogic';
import { Character } from './Character';
import { GameDialogue } from './GameDialogue';
import { sceneEventConstants } from './sceneEvents';
import { PlayerControlls, ButcherControlls } from './Controlls';
import { EdgeOfPathPoint, PathPlanner, PathPoint } from '~/levelComponents/PathPlanner';

class PawnHandler {
    characters: Record<string, Character> = {}

    add(key: string, c: Character) {
        this.characters[key] = c
    }

    update(_time: number, delta: number) {
        for (const c of Object.values(this.characters)) {
            c.update(delta)
        }
    }
}

type SceneNavigationMesh = {
    vertices: NavMeshPointMap;
    edges: Record<string, EdgeOfPathPoint[]>;
}

class NavMeshSceneTop {
    mesh: SceneNavigationMesh = { vertices: new Map(), edges: {} };
    edges: Record<string, EdgeOfPathPoint[]> = {};

    waypoints: Record<string, {
        x: number, y: number,
        size: number
    }> = {};

    getOrCreateEdgePathPointList(key: string) {
        if (!this.edges[key]) {
            this.edges[key] = [];
        }
        return this.edges[key];
    }
    calculatePointEdges(scene: Phaser.Scene) {
        for (const [key, wp] of Object.entries(this.waypoints)) {
            const wayPointKeyTop = `${wp.x}_${wp.y - wp.size}`;
            const wayPointKeyRight = `${wp.x + wp.size}_${wp.y}`;
            this.tryConnectPointsToEdge(scene, key, wayPointKeyTop);
            this.tryConnectPointsToEdge(scene, key, wayPointKeyRight);
        }

        console.log("EDGES---", this.edges);
    }

    tryConnectPointsToEdge(scene: Phaser.Scene, keyFrom: string, keyTo: string) {
        if (!this.waypoints[keyTo]) {
            return
        }

        const p1 = this.waypoints[keyFrom];
        const p2 = this.waypoints[keyTo];
        const bodies = scene.matter.intersectRay(p1.x, p1.y, p2.x, p2.y, 1)
            // @ts-ignore    here we know for a fact these parameters exist, only interested in static objects, as path goes between WALLS
            .filter((b) => !b.isSensor && b.isStatic);

        // path is free to walk
        if (bodies.length === 0) {
            this.getOrCreateEdgePathPointList(keyFrom).push(
                {
                    to: keyTo, cost: 1
                }
            )

            this.getOrCreateEdgePathPointList(keyTo).push(
                {
                    to: keyFrom, cost: 1
                }
            )
        }
    }


    getPath(from: PathPoint, to: PathPoint) {
        const planner = new PathPlanner(
            new Map(Object.entries(this.waypoints)),
            this.edges
        );

        let fromKey = this.closest(from);
        let toKey = this.closest(to);

        if (!fromKey || !toKey) {
            return null;
        }
        const result = planner.execute(
            fromKey,
            toKey
        );

        console.log("=======>>>>>>> path", result);
        return result;
    }

    closest(p: PathPoint): string | null {
        let minDistance = 10000000;
        let closestPoint: string | null = null;
        for (let a in this.waypoints) {
            const distance = Math.sqrt((p.x - this.waypoints[a].x) * (p.x - this.waypoints[a].x) + (p.y - this.waypoints[a].y) * (p.y - this.waypoints[a].y));

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = a;
            }
        }
        return closestPoint;
    }

}

export class GameSceneTop extends Phaser.Scene {

    map!: Phaser.Tilemaps.Tilemap;
    // navMesh!: NavMesh;

    graphics!: Phaser.GameObjects.Graphics;
    // controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    visualLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    scriptedDialogs: GameDialogue[] = [];

    blackboard: Record<string, unknown> = {};
    tileset!: Phaser.Tilemaps.Tileset;

    pawnHandler = new PawnHandler();

    navMesh = new NavMeshSceneTop()

    constructor() {
        super({
            key: CST.SCENES.GAME,
        });
    }

    init(sceneMessagePayload: any) {
        console.log("data passed to this scene", sceneMessagePayload);
    }

    preload() {
    }

    showWaypoints() {
        console.log(">>>>>>", this.navMesh.waypoints);
        this.navMesh.calculatePointEdges(this);

        const graphics = this.add.graphics({ lineStyle: { color: 0xff0000 } });
        let maxDepth = 0;
        for (const w of Object.values(this.navMesh.waypoints)) {
            const circle = new Phaser.Geom.Circle(0, 0, 5);
            circle.setPosition(w.x, w.y);
            graphics.strokeCircleShape(circle);
            maxDepth = Math.max(maxDepth, w.y)
        }


        for (const edgeFromPointKey in this.navMesh.edges) {
            const from = this.navMesh.waypoints[edgeFromPointKey];

            for (const e of this.navMesh.edges[edgeFromPointKey]) {
                const to = this.navMesh.waypoints[e.to];
                const l = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
                graphics.strokeLineShape(l);
            }
        }

        // TODO - move this to character follow
        const butcher = this.pawnHandler.characters['butcher'];
        const pathGraphics = this.add.graphics({ lineStyle: { color: 0x00ff00 } });


        setInterval(() => {
            // @ts-ignore
            if (!(butcher.currentState?.autoFollowPathPoints)) {
                return;
            }

            // @ts-ignore
            const toDrawPAth = butcher.currentState.autoFollowPathPoints;

            // debugger
            pathGraphics.clear();
            if (toDrawPAth) {
                let lastPoint: NavMeshPoint | null = null;

                for (const p of toDrawPAth) {
                    if (lastPoint) {
                        const l = new Phaser.Geom.Line(lastPoint.x, lastPoint.y, p.x, p.y);
                        pathGraphics.strokeLineShape(l);
                    }

                    lastPoint = p;
                }

            }

        }, 1000);

        pathGraphics.setDepth(maxDepth + 10);

        graphics.setDepth(maxDepth + 10);

    }
    create() {
        this.addLevelFloorAndLightsGetWaypoints();

        this.showWaypoints();

        // this.createAnimatedTiles();
        this.cameras.main.setOrigin(0.1, 1);
        this.lights.enable().setAmbientColor(0x111111);

        jsonLogic.rm_operation('setVar');
        jsonLogic.add_operation('setVar', this.jsLogicSetBlackboardVar.bind(this));
        this.addPhysicsListeners();

        this.events.on('characterDeath', this.onCharacterDeath, this);
        this.events.on(sceneEventConstants.requestCharacterFollowPath, this.onRequestCharacterFollowPath, this);
    }

    getLogicObjectFromLayer(logicLayerObjectId: string) {
        const logicObject = this.map.getObjectLayer('logic')?.objects.find(({ id }) => {
            return id.toString() === logicLayerObjectId
        });
        return logicObject;
    }

    onRequestCharacterFollowPath(character: Character, characterId: string) {
        const pawn = this.pawnHandler.characters[characterId];
        if (!pawn) {
            // Todo - inform characterPawn: path finished/not found
            return;
        }
        if (pawn === character) {
            return
        }

        // debugger

        // console.log("======>>>>", character.sprite, pawn.sprite);
        const toDrawPAth = this.navMesh.getPath(pawn.sprite, character.sprite) || [];
        character.setAutoPathFollowSchedule(toDrawPAth);
    }

    onCharacterDeath(character: Character) {
        // console.log("KILLL CHARACTER", character.imageFramePrefix);
        const bloodTileIndexInTilemap = 24;
        const x = character.sprite.x;
        const y = character.sprite.y;
        const bloodTile = this.add.image(x, y, 'tiles', bloodTileIndexInTilemap)
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

        // console.log('>>>>>MMM>>>', key, '|', value);
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
            // console.log('RYYYYLE', rulePre);
            const res = jsonLogic.apply(rulePre, this.blackboard);
            if (!res) {

                // console.log(":::PREEEE:>>>", res);
                if (d.rulePreFail) {
                    return this.processGameDialogue(d.rulePreFail, gameObject, receiver);
                }
                return false;
            }
        }

        if (receiver && d.actor) {
            if (d.actor.events) {
                // console.log('WHHHHHAAAAT?', d.actor);
                d.actor.events.forEach(({ name, value }) => {
                    receiver.emit(name, value);
                });
            }
        }

        const playerPawn = this.pawnHandler.characters['player'];
        playerPawn.bark(player);

        const enemyPawn = this.pawnHandler.characters['butcher'];
        enemyPawn.bark(enemy);

        if (enemySpeed) {
            enemyPawn.lastDirection.x = enemySpeed.x;
            enemyPawn.lastDirection.y = enemySpeed.y;
        }
        if (enemyIdle) {
            enemyPawn.defaultAnimation = enemyIdle;
        }

        if (enemyCanChase !== undefined) {
            const { sprite } = playerPawn;
            enemyPawn.sprite.emit('chase', !!enemyCanChase, sprite.x, sprite.y);
        }
        if (playerTexture) {
            playerPawn.imageFramePrefix = playerTexture;
        }

        if (playerMoveAnim) {
            playerPawn.moveAnim = playerMoveAnim;
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

            // console.log("====woooooo", ids, gameObjects);
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
            // console.log('RYYYYLE POOOOST', rulePost);
            const res = jsonLogic.apply(rulePost, this.blackboard);
            // console.log(":::Pooooooost:>>>", res);
        }

        this.time.delayedCall(2500, () => {
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

    addLevelFloorAndLightsGetWaypoints() {

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

                    // Todo key gen should be in navmesh
                    const wayPointKey = `${t.pixelX + t.width / 2}_${t.pixelY + t.height / 2}`;
                    // if tile not a 'visible above all layers' sprite, then add it to walkable'ish list
                    // Note - probably need to move into separate function
                    if (!t.properties.above) {
                        if (!this.navMesh.waypoints[wayPointKey]) {
                            this.navMesh.waypoints[wayPointKey] = {
                                x: t.pixelX + t.width / 2,
                                y: t.pixelY + t.height / 2,
                                size: t.width, // needed to calculate neighbour position
                            }
                        }
                    }

                    let depth = 0;
                    if (t.properties.wall) {
                        depth += t.pixelY + t.height - 10;
                    }
                    if (t.properties.above) {
                        depth += t.pixelY + t.height * 2;
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




        this.cameras.main.fadeIn(2000, 0, 0, 0);


        this.cameras.main.setZoom(0.5);
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
                this.processLogicLayerObjects(
                    this.map.getObjectLayer(n)
                );
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

                // console.log("objects in ", n, objects);

                objects.forEach((t) => {
                    // const smartTile = this.matter.add.image(t.x, t.y - t.height, 'tiles', t.gid - 1)

                    const smartTile = (new SpriteWithDepth(this, t.x, t.y - t.height, 'tiles', t.gid - 1))
                        .setDepth(
                            t.y
                        )
                        .setOrigin(0, 0)
                        .setPipeline('Light2D')
                        .setName(t.id.toString());
                    // console.log("----ID", t.id.toString());

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

    processLogicLayerObjects(currLayer: Phaser.Tilemaps.ObjectLayer | null) {
        if (!currLayer) {
            return
        }

        if (currLayer.name !== 'logic') {
            throw "passed incorrect layer to 'Logic' object processor"
        }
        if (currLayer.properties) {
            // layer properties is actually an array of name to value objects

            /**
             * @typedef {Object} layerObjectPropItem
             * @property {string} name - property name, hoping to get Blackboard
             * @protected {string} value - of a blackboard in Json string, needs to be parsed
             */

            /**
             * @type { LogicLayerObjectPropItem[] }
             */
            const properties = currLayer.properties as Record<string, string>[];
            const blackboard = properties.find(({ name }) => name === 'blackboard')
            if (!blackboard) {
                throw "Logic layer doesn't have Blackboard property - a json object"
            }

            this.blackboard = JSON.parse(blackboard.value);
        }

        currLayer.objects.forEach(o => {
            const pp = o;

            if (o.name === 'start') {
                this.spawnPlayableCharacter(o);
            }
            if (o.name === 'enemyStart') {
                this.spawnNonPlayableCharacter(o);

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
                        pp.x ?? 0, pp.y ?? 0, o.width ?? 30,
                        { ignoreGravity: true, isStatic: true, ...physicsOptions }
                    );
                }
            }
        });
    }

    spawnNonPlayableCharacter(o: Phaser.Types.Tilemaps.TiledObject) {
        if (o.name !== 'enemyStart') {
            throw "Not spawning from correct Logic TiledObject, expecting 'enemyStart'"
        }

        const pawn = new Character(this, o.x ?? 0, (o.y ?? 0) - 50, 'walk-NE.png', 'enemy');
        pawn.controller = new ButcherControlls(this, pawn);
        pawn.lastDirection.x = 1;
        pawn.lastDirection.y = -1;
        pawn.moveAnim = 'walk';
        this.pawnHandler.add('butcher', pawn);
        pawn.id = "butcher";

        const onInitEvent = o.properties.find(({ name }) => name === 'onInit');
        if (onInitEvent) {
            const scheduleIds = (JSON.parse(onInitEvent.value) as GameDialogue).schedule?.ids ?? [];

            const schedulePointsOrNull: (NavMeshPoint | null)[] = scheduleIds.map((id: string) => {
                const logicObject = this.getLogicObjectFromLayer(id);
                if (!logicObject) {
                    return null;
                }

                return {
                    x: logicObject.x ?? 0,
                    y: logicObject.y ?? 0,
                }
            });


            pawn.setAutoPathFollowSchedule(
                schedulePointsOrNull
                    .filter(o => o !== null) as NavMeshPoint[]
            )
        }


    }

    spawnPlayableCharacter(o: Phaser.Types.Tilemaps.TiledObject) {
        if (o.name !== 'start') {
            throw "Not spawning from correct Logic TiledObject, expecting 'start'"
        }

        const pawn = new Character(this, o.x ?? 0, o.y ?? 0, 'walk-NE.png', 'player');
        pawn.controller = new PlayerControlls(this, pawn)

        this.pawnHandler.add('player', pawn);
        pawn.id = 'player';

        this.cameras.main.centerOn(o.x ?? 0, o.y ?? 0);
        this.cameras.main.startFollow(pawn.sprite, true, 0.2, 0.2, 350, -this.cameras.main.height / 2);


    }

    /*
     * @description Check if tile has any sub objects that contain collision shape information. Disregarding if sensor or anything else
    */
    tileHasCollisions(tile: {
        index: number
    }) {
        const collisionGroup = this.tileset.getTileCollisionGroup(tile.index);
        // @ts-ignore
        return !(!collisionGroup || collisionGroup.objects.length === 0)
    }
    makeTileCollision(tile: {
        index: number,
        pixelX: number,
        pixelY: number
        allowStatic: boolean
    }, objectProps: { name: string, value: string | boolean }[] = []): { dialogue: Record<string, unknown>, bodyParts: MatterJS.BodyType[], kinematic: boolean, radius: number, tween?: Record<string, unknown> } | null {
        const tileWorldPos = tile;

        if (!this.tileHasCollisions(tile)) {
            return null;
        }

        const collisionGroup = this.tileset.getTileCollisionGroup(tile.index);
        const bodyParts: MatterJS.BodyType[] = [];
        // The group will have an array of objects - these are the individual collision shapes
        const objects = collisionGroup.objects;

        let kinematic = false;
        let radius = 30; // default for kinematic object
        let objectTween: Record<string, unknown> | undefined = undefined;
        let dialogue = {};
        // console.log("-----------", tile.index, collisionGroup);

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

            // console.log("==========KINEMATIC", isKinematic);
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
        this.pawnHandler.update(time, delta);
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
