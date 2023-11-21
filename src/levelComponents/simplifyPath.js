/**
 * @param {Object[]} p - path as array of x y coordinates
 * @param {number} p[].x
 * @param {number} p[].y
 */
export function simplifyPath(p) {

    const newPath = [p[0]];

    for (let i = 1; i < p.length; i++) {
        const sameYAsPrev = p[i - 1].x !== p[i].x && p[i - 1].y === p[i].y;
        const sameYAsNext = i + 1 < p.length && p[i + 1].x !== p[i].x && p[i - 1].y === p[i].y;


        if (!(sameYAsNext && sameYAsPrev)) {
            const newP = p[i - 1];
            if (sameYAsPrev) {
                newP.navLabel = 0; // walk - navLabelType 
            } 
            if (p[i-1].y > p[i].y){
                newP.navLabel = 1; // jump
            }
            newPath.push(newP);
        }
    }

    return newPath;
}
