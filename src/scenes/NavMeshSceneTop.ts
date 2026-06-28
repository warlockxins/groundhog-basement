import {
  EdgeOfPathPoint,
  PATH_POINT_KEY,
  PathPoint,
  PathPlanner,
} from "../levelComponents/PathPlanner";
import { closestPointInRecords } from "./GameSceneTop";

// TODO - WAYPOINTS can use their tileset x and Y index, save that info to waypoint too
export type Waypoint = {
  x: number;
  y: number;
  size: number;
  xIndex: number;
  yIndex: number;
};

export class NavMeshSceneTop {
  edges: Record<string, EdgeOfPathPoint[]> = {};

  waypoints: Record<number, Waypoint> = {};
  graphics!: Phaser.GameObjects.Graphics;

  static getKeyForWaypointAt(x: number, y: number): number {
    return (x << 16) | y;
  }
  getOrCreateEdgePathPointList(key: number) {
    if (!this.edges[key]) {
      this.edges[key] = [];
    }
    return this.edges[key];
  }
  calculatePointEdges(scene: Phaser.Scene) {
    this.edges = {};
    for (const [key, wp] of Object.entries(this.waypoints)) {
      this.calculateWaypointEdgeToRightAndBottom(+key, wp, scene);
    }
  }

  calculateWaypointEdgeToRightAndBottom(
    key: PATH_POINT_KEY,
    wp: Waypoint,
    scene: Phaser.Scene,
  ) {
    const wayPointKeyTop = NavMeshSceneTop.getKeyForWaypointAt(
      wp.xIndex,
      wp.yIndex - 1,
    );
    const wayPointKeyRight = NavMeshSceneTop.getKeyForWaypointAt(
      wp.xIndex + 1,
      wp.yIndex,
    );

    this.tryConnectPointsToEdge(scene, key, wayPointKeyTop);
    this.tryConnectPointsToEdge(scene, key, wayPointKeyRight);
  }

  tryConnectPointsToEdge(
    scene: Phaser.Scene,
    keyFrom: PATH_POINT_KEY,
    keyTo: PATH_POINT_KEY,
  ) {
    if (!this.waypoints[keyTo]) {
      return;
    }

    const p1 = this.waypoints[keyFrom];
    const p2 = this.waypoints[keyTo];

    const bodies = scene.matter
      .intersectRay(p1.x, p1.y, p2.x, p2.y, 1)
      // @ts-ignore    here we know for a fact these parameters exist, only interested in static objects, as path goes between WALLS
      .filter((b) => !b.isSensor && b.isStatic);

    // path is free to walk
    if (bodies.length === 0) {
      this.getOrCreateEdgePathPointList(keyFrom).push({
        to: keyTo,
        cost: 1,
      });

      this.getOrCreateEdgePathPointList(keyTo).push({
        to: keyFrom,
        cost: 1,
      });
    } else {
      const points = this.getOrCreateEdgePathPointList(keyFrom);
      const indexFrom = points.findIndex((p) => p.to === keyFrom);
      const indexTo = points.findIndex((p) => p.to === keyTo);

      if (indexFrom !== -1) {
        points.splice(indexFrom, 1);
      }
      if (indexTo !== -1) {
        points.splice(indexTo, 1);
      }
    }
  }

  recalculateAt(x: number, y: number, scene: Phaser.Scene) {
    const from = this.closest({
      x,
      y,
    });
    // debugger;
    if (!from) {
      return;
    }
    this.calculateWaypointEdgeToRightAndBottom(
      from,
      this.waypoints[from],
      scene,
    );

    this.showWaypoints(scene);
  }

  getPath(from: PathPoint, to: PathPoint) {
    const planner = new PathPlanner(
      new Map(Object.entries(this.waypoints).map((e) => [+e[0], e[1]])),
      this.edges,
    );

    let fromKey = this.closest(from);
    let toKey = this.closest(to);

    if (!fromKey || !toKey) {
      return null;
    }
    const result = planner.execute(
      // @ts-ignore
      +fromKey,
      +toKey,
    );

    // console.log("=======>>>>>>> path", result);
    if (result.length > 1) {
      result[result.length - 1] = from;
    }

    return result;
  }

  closest(p: PathPoint): number | null {
    return closestPointInRecords(p, this.waypoints);
  }

  showWaypoints(scene: Phaser.Scene) {
    // console.log(">>>>>>", this.waypoints);
    this.calculatePointEdges(scene);

    if (!scene.matter.world.drawDebug) {
      return;
    }

    if (!this.graphics) {
      this.graphics = scene.add.graphics({ lineStyle: { color: 0xff0000 } });
    } else {
      this.graphics.clear();
    }

    let maxDepth = 0;
    // for (const w of Object.values(this.waypoints)) {
    //   const circle = new Phaser.Geom.Circle(0, 0, 5);
    //   circle.setPosition(w.x, w.y);
    //   this.graphics.strokeCircleShape(circle);
    //   maxDepth = Math.max(maxDepth, w.y);
    // }
    for (const edgeFromPointKey in this.edges) {
      const from = this.waypoints[edgeFromPointKey];

      for (const e of this.edges[edgeFromPointKey]) {
        const to = this.waypoints[e.to];
        const l = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
        this.graphics.strokeLineShape(l);
      }
    }

    this.graphics.setDepth(maxDepth + 10);
  }
}
