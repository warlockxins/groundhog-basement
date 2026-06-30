import VisibilityPolygon from "../levelComponents/visibility_polygon_dev";

export class ShadowRenderer {
    private shadowCasterPoints!: [number, number][][];
    private shadowCasterGraphics!: Phaser.GameObjects.Graphics;
    private shadowCasterPointsCompiled!: any[][];
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.shadowCasterPoints = [];
    }

    addShadowShape(shadowCasterShape: [number, number][]) {
        this.shadowCasterPoints.push(shadowCasterShape);
    }

    displayShadowCasters() {
        const segments = VisibilityPolygon.convertToSegments(
            this.shadowCasterPoints,
        );
        this.shadowCasterPointsCompiled =
            VisibilityPolygon.breakIntersections(segments);

        this.shadowCasterGraphics = this.scene.add.graphics();
        this.shadowCasterGraphics.setBlendMode(Phaser.BlendModes.MULTIPLY);
        // Note - right above ground tiles
        this.shadowCasterGraphics.setDepth(1);
        this.shadowCasterGraphics.alpha = 0.6;
    }

    private drawShadowTriangles(
        visibility: [number, number][],
        transparencies: number[],
    ) {
        this.shadowCasterGraphics.clear();

        if (!visibility?.length) {
            return;
        }

        for (let i = 0; i < visibility.length - 4; i += 4) {
            const one = {
                x: visibility[i][0],
                y: visibility[i][1],
            };
            // debugger
            const two = {
                x: visibility[i + 1][0],
                y: visibility[i + 1][1],
            };

            const three = {
                x: visibility[i + 2][0],
                y: visibility[i + 2][1],
            };

            const four = {
                x: visibility[i + 3][0],
                y: visibility[i + 3][1],
            };

            const c1 = transparencies[i];
            const c2 = transparencies[i + 1];
            const c3 = transparencies[i + 2];
            const c4 = transparencies[i + 3];

            const color1 = new Phaser.Display.Color(c1, c1, c1).color;
            const color2 = new Phaser.Display.Color(c2, c2, c2).color;
            const color3 = new Phaser.Display.Color(c3, c3, c3).color;
            const color4 = new Phaser.Display.Color(c4, c4, c4).color;

            this.shadowCasterGraphics.fillGradientStyle(color3, color2, color1, 0, 1);

            this.shadowCasterGraphics.fillTriangle(
                three.x,
                three.y,
                two.x,
                two.y,
                one.x,
                one.y,
            );

            this.shadowCasterGraphics.fillGradientStyle(color1, color3, color4, 0, 1);

            this.shadowCasterGraphics.fillTriangle(
                one.x,
                one.y,
                three.x,
                three.y,
                four.x,
                four.y,
            );
        }
    }

    update(x: number, y: number) {
        const { transparencies, quad } = VisibilityPolygon.computeInverse(
            [x, y],
            this.shadowCasterPointsCompiled,
        );
        this.drawShadowTriangles(quad, transparencies);
    }
}