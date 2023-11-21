import { NavMeshPointMap, NavMeshPoint } from './NavMesh';
import { simplifyPath } from './simplifyPath';

class PathTableItem {
    cost: any;
    from: any;
    heuristic: number;
    /**
     * 
     * @param {number} cost 
     * @param {string} from 
     * @param {number} heuristic 
     */
    constructor(cost, from, heuristic = 0) {
        this.cost = cost;
        this.from = from;
        this.heuristic = heuristic;
    }
}

export type PathPoint = {
    x: number;
    y: number;
}

export class PathPlanner {
    unvisited: string[];
    vertexes: NavMeshPointMap;
    edges: any;
    pathTable: {};
    visited: any[];
    /**
     * 
     * @param {Map} vertexes 
     * @param {*} edges 
     */
    constructor(vertexes: NavMeshPointMap, edges: {}) {
        this.vertexes = vertexes;
        this.edges = edges;
        this.unvisited = [];
        this.pathTable = {};
        this.visited = [];
    }

    /**
     * this needs should help calculate optimistic right direction, 
     * Must override per need
     * by default just 0
     * 
     * @param {*} fromNode vertex
     * @param {*} toNode vertex
     * @returns number
     */
    calculateHeuristic(fromNode: PathPoint, toNode: PathPoint) {
        return Math.sqrt(Math.pow((fromNode.x - toNode.x), 2) + Math.pow((fromNode.y - toNode.y), 2));
    }

    /**
     * @param {string} from vertex key
     */
    resetPathTable(from: string) {
        const fromNode = this.vertexes.get(from);

        for (const [key, _node] of this.vertexes) {
            this.pathTable[key] =
                key === from ?
                    new PathTableItem(0, undefined, 0)
                    : new PathTableItem(Number.POSITIVE_INFINITY, undefined, this.calculateHeuristic(fromNode, this.vertexes.get(key)))
        }
    }

    calculateNeighboursDistance(currentNode: string) {
        const neighbours = this.edges[currentNode];
        if (!neighbours || neighbours.length === 0) {
            return;
        }

        const distFrom = this.pathTable[currentNode].cost;

        neighbours.forEach((edge) => {
            if (this.visited.indexOf(edge.to) === -1) {
                this.unvisited.push(edge.to);
            }
            const elementTo = this.pathTable[edge.to];

            const cost = distFrom + edge.cost;

            if (elementTo?.cost > cost) {
                elementTo.cost = cost;
                elementTo.from = currentNode;
            }
        });
    }

    pickNextVertexKey(): string | undefined {
        let smallest = Number.POSITIVE_INFINITY;
        let cheapCostKey: string | undefined = undefined;

        this.unvisited.forEach((vertexKey) => {
            const currentItem = this.pathTable[vertexKey];
            if (currentItem && this.visited.indexOf(vertexKey) === -1) {
                const { cost, heuristic } = this.pathTable[vertexKey];
                const itemCostWithHeuristic = cost + heuristic;

                if (itemCostWithHeuristic < smallest) {
                    smallest = itemCostWithHeuristic;
                    cheapCostKey = vertexKey;
                }
            }
        });

        return cheapCostKey;
    }

    removeUnvisited(vertexKey: string) {
        const index = this.unvisited.indexOf(vertexKey);
        if (index != -1) {
            this.unvisited.splice(index, 1);
        }
    }

    extractPath(to: string): NavMeshPoint[] {
        let currentNode = to;
        const path: NavMeshPoint[] = [];

        while (currentNode) {
            const p = this.vertexes.get(currentNode);
            if (p) {
                path.push(p);
            }
            currentNode = this.pathTable[currentNode].from;
        }
        const p = path.reverse();

        return simplifyPath(p);
    }

    execute(from: string, to: string): NavMeshPoint[] {
        const fromNode = this.vertexes.get(from);
        if (!fromNode) {
            return [];
        };

        this.resetPathTable(from);
        let currentNode: string | undefined = from;
        this.unvisited.push(from);

        while (currentNode) {
            if (currentNode === to) {
                return this.extractPath(to);
            }

            this.calculateNeighboursDistance(currentNode);

            this.visited.push(currentNode);
            this.removeUnvisited(currentNode);
            currentNode = this.pickNextVertexKey();
        }

        return [];
    }
}
