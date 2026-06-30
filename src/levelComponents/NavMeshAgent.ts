import { NavMesh } from './NavMesh';
import { PathPlanner } from './PathPlanner';
export class NavMeshAgent {
    navMesn: NavMesh;

    constructor(navMesh: NavMesh) {
        this.navMesn = navMesh;
    }

    searchFromTo(start, end, vertices, edges) {
        console.time('--- Path find');
        const planner = new PathPlanner(vertices, edges); //new PathPlanner(vertices, edges);
        const result = planner.execute(start, end)
        console.log('---->', result);
    }
}
