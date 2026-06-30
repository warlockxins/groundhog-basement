const helpers = {
    solid: 1,
    wayPointGround: 2,
}

export enum navLabelType  {
    walk = 0,
    jump = 1
};

export type NavMeshPoint = {
    x: number;
    y: number;
    navLabel?: navLabelType; 
};

export type NavMeshPointMap = Map<string, NavMeshPoint>;

export class NavMesh {
    mesh: { columns: {}; vertices: NavMeshPointMap; edges: {}; };
    stepX: number = 0;
    stepY: number = 0;
    
    constructor(tilemap: Phaser.Tilemaps.Tilemap, tileLayer: Phaser.Tilemaps.DynamicTilemapLayer) {
        // get collidable tiles in range for path finding
      // offset is needed to place vertices in the middle and above the tile
        const offsetX = 0;//tilemap.tileWidth / 2;
        const offsetY = 0;//-tilemap.tileHeight / 2;
        this.stepX = tilemap.tileWidth;
        this.stepY = tilemap.tileHeight;

        const tilesInRect = tilemap.getTilesWithin(0, 0, 50, 100, { isNotEmpty: true, isColliding: true }, tileLayer).map(({ pixelX, pixelY }) => {
            return { x: pixelX + offsetX, y: pixelY + offsetY}
        });

        this.mesh = this.pointsToTable(tilesInRect);
    }

  findWayPointBelow(x: number, y: number): NavMeshPoint | null {
    const meshX = Math.round(x/this.stepX) * this.stepX;// + this.stepX/2;
    const meshY = Math.round(y/this.stepY) * this.stepY; //+ this.stepY/2;
    if(!this.mesh.columns[meshX]) {
      return null;
    }

    const currPoint = this.mesh.columns[meshX][meshY];
    if (currPoint) {
       return {
          x: meshX,
          y: meshY
       }
    }

    // find closest y in column
    const yOption = Object.keys(this.mesh.columns[meshX])
      .find(yKey => {
        return +yKey- meshY  >= 0;
      });
  
    if (!yOption) {
      return null;
    }
   
    return {
      x: meshX,
      y: +yOption
    }

  }


  pointsToTable(points: NavMeshPoint[]) {
      const vertices: NavMeshPointMap = new Map();
      const edges = {};

      const columns: {[key: string]: {[k:string]: number}} = {};

      // fill walkable tiles from waypoints
      points.forEach(p => {
          if (!columns[p.x])
              columns[p.x] = {};
          columns[p.x][p.y] = helpers.solid;

          const curVertexName = `${p.x}:${p.y}`;
          vertices.set(curVertexName, p);
      });


      // fill points for falling from current block to left and right ... safely
      const checkSides = [-1, 1];
      const keys = Object.keys(columns);
      for (let index = 0; index < keys.length; index++) {

          const curColumn = columns[keys[index]];

          for (const [curY, _tileType] of Object.entries(curColumn)) {
            
//            debugger;
              const curVertexName = `${keys[index]}:${curY}`;

              const upY = (+curY) - 1 * this.stepY;
              const curTileUp = curColumn[upY];

              // we can't stand on this - have tile stacked above
              if (curTileUp ) {
                const missVertexName = `${keys[index]}:${curY}`;

                vertices.delete(missVertexName);
                continue;
              }

              for (const offset of checkSides) {
                  const resIndex = index + offset;
                  if (resIndex < 0) continue;
                  if (resIndex > keys.length) continue;

                  const checkColumnKey = keys[resIndex];
                  const columnCheck = columns[checkColumnKey];
                  if (!columnCheck) {
                    continue
                  }
                  // on side, has vertex above - can\t stand
                  if (columnCheck[curY] && columnCheck[upY]) {
                      continue;
                  }

                  connectHorizontalTiles(edges, curVertexName, `${checkColumnKey}:${curY}`, 1);
                  // check if can fall down to neighbour tile
                
                  const posBelow = columnWillLand(columnCheck, upY);
                  if (posBelow) {
                      const fromVertexKey = `${keys[index]}:${curY}`;
                      const toVertexKey = `${checkColumnKey}:${posBelow.y}`;
                      const diagonalCost = 1;
                      // jump down is possible = add to points && edges
                      // debugger
                      const wayPointVertexNameToJumpUp = `${checkColumnKey}:${curY}`;
                      vertices.set(wayPointVertexNameToJumpUp, { x: +checkColumnKey, y: +curY });

                      // jump down
                      connectHorizontalTiles(edges, fromVertexKey, toVertexKey, diagonalCost);


                      // Todo calculate if can jump up a tile (jump height dependency)
                      // first jump to empty waypoint then minair to other point on ground
                      connectHorizontalTiles(edges, toVertexKey, wayPointVertexNameToJumpUp, 1);
                      connectHorizontalTiles(edges, wayPointVertexNameToJumpUp, fromVertexKey, 1);

                  }
                
                  
              }
              
          }
      }
      return { columns, vertices, edges };
  }
}

function connectHorizontalTiles(inEdges, curVertexName, toVertexName, cost) {
    if (!inEdges[curVertexName]) {
        inEdges[curVertexName] = [];
    }
    inEdges[curVertexName].push({ to: toVertexName, cost: cost });

}


function columnWillLand(column: Map, belowStart: number) {
    let lowest = { y: belowStart, waypointType: -1 };
    for (const [y, waypointType] of Object.entries(column)) {
        if (waypointType === 1 && y > belowStart) {
            lowest = { y, waypointType }
        }
    }
    return lowest.waypointType === -1 ? undefined : lowest;
}
