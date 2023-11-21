import { ControllableCharacter, ScriptComponent } from "~/Sprite/interfaces";
import { PathPlanner } from '../levelComponents/PathPlanner';
import { GameScene } from '~/scenes/GameScene';
import { NavMeshPointMap, NavMeshPoint, navLabelType } from '~/levelComponents/NavMesh';

const resetInterval = 700;

type Point = {
    x: number, y: number
}

enum NavigationState {
    FOUND,
    NOT_FOUND,
    ARRIVED
}

export class PlatformerInputAgent implements ScriptComponent {
    gameObject: ControllableCharacter & Phaser.GameObjects.GameObject;
    scene: GameScene;//Phaser.Scene;

    resetTimer = 0;
    targetObject?: Phaser.GameObjects.GameObject;

    currentSelectedPath: NavMeshPoint[] = [];
    pathGraphics!: Phaser.GameObjects.Graphics;

    navigationState: NavigationState = NavigationState.NOT_FOUND;
    lastDestination: NavMeshPoint | null = null;

    constructor(_scene: Phaser.Scene, gameObject: ControllableCharacter & Phaser.GameObjects.GameObject) {
        this.gameObject = gameObject;
        this.scene = _scene as GameScene;
    }

    createPathDebugSpline() {
        if (!this.scene.game.config.physics.arcade?.debug) {
            return;
        }

        if (!this.pathGraphics) {
            this.pathGraphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });
        }

        this.pathGraphics.clear();

        for (let i = 0; i < this.currentSelectedPath.length - 1; i++) {
            const line = new Phaser.Geom.Line(this.currentSelectedPath[i].x, this.currentSelectedPath[i].y, this.currentSelectedPath[i + 1].x, this.currentSelectedPath[i + 1].y);
            this.pathGraphics.strokeLineShape(line);
        }
    }

    setTarget(targetObject?: Phaser.GameObjects.GameObject) {
        this.targetObject = targetObject;
    }

    calculatePathToTarget(): NavigationState {
        if (!this.targetObject) {
            return NavigationState.NOT_FOUND;
        }

        const to = this.targetObject.body.position;
        const destination = this.scene.navMesh.findWayPointBelow(to.x, to.y);

        if (!destination) {
            this.currentSelectedPath = [];
            this.lastDestination = null;
            return NavigationState.NOT_FOUND;
        }

        if (this.lastDestination) {
            if (this.lastDestination.x === destination.x && this.lastDestination.y === destination.y) {
                return NavigationState.FOUND;
            }
        }

        const from = this.gameObject.body.position;
        const dist = this.calculateDistance(from, to);
        // Todo - use tile width for min distance or config parameter
        if (dist < 10) return NavigationState.ARRIVED;
        else if (dist > 200) {
            this.currentSelectedPath = [];
            this.lastDestination = null;
            return NavigationState.NOT_FOUND;
        }

        const start = this.scene.navMesh.findWayPointBelow(from.x, from.y);

        if (!start) {
            this.currentSelectedPath = [];
            this.lastDestination = null;
            return NavigationState.NOT_FOUND;
        }

        this.lastDestination = destination;

        const { vertices, edges } = this.scene.navMesh.mesh;
        const planner = new PathPlanner(vertices, edges);
        const path = planner.execute(PointToKey(start), PointToKey(destination));
        path.shift();
        this.currentSelectedPath = path;
        return NavigationState.FOUND;
    }

    calculateDistance(fromNode: NavMeshPoint, toNode: NavMeshPoint) {
        return Math.sqrt(Math.pow((fromNode.x - toNode.x), 2) + Math.pow((fromNode.y - toNode.y), 2));
    }

    resetControls() {
        this.gameObject.direction.x = 0;
        this.gameObject.direction.y = 0;
    }

    getNextPathPoint() {
        const pos = this.gameObject.body.position;


        const nextPathPoint = this.currentSelectedPath[0];

        if (this.currentSelectedPath.length < 2) {
            return nextPathPoint;
        }

        const followingPathPoint = this.currentSelectedPath[1];
        const ps = [followingPathPoint, nextPathPoint].sort((a, b) => a.x - b.x);

        // is between 2 first points then prefer next immediately
        if (pos.x > ps[0].x && pos.x < ps[1].x) {
            if (ps[0] === nextPathPoint) {
                return followingPathPoint;
            }
        }

        return nextPathPoint;
    }

    update(delta: number) {
        this.resetControls();
        this.resetTimer += delta;

        if (this.gameObject.isOnGround() && this.resetTimer > resetInterval) {
            this.resetTimer = 0;
            this.navigationState = this.calculatePathToTarget();
        }

        this.createPathDebugSpline();

        if (this.navigationState === NavigationState.ARRIVED || this.navigationState === NavigationState.NOT_FOUND) {
            return;
        }


        if (this.currentSelectedPath.length === 0) {
            this.gameObject.direction.x = 0;
            return;
        }


        const pos = this.gameObject.body.position;
        const nextPathPoint = this.getNextPathPoint();

        if (nextPathPoint.navLabel === navLabelType.jump) {
            this.gameObject.direction.y = 1;
            this.currentSelectedPath.shift();
            return;
        }

        const distToTarget = nextPathPoint.x - pos.x;
        const directionStrength = Math.abs(distToTarget) > 1 ? distToTarget : 0;
        if (directionStrength !== 0) {
            if (Math.abs(directionStrength) < 20) {
                this.gameObject.direction.x = directionStrength / 20.;
            }
            else {
                this.gameObject.direction.x = directionStrength > 0 ? 1 : -1;
            }
        } else {
            this.currentSelectedPath.shift();
        }
    }

    destroy() { }
};

function PointToKey(p: Point) {
    return `${p.x}:${p.y}`;
}

