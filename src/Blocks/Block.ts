import { Axis } from "@babylonjs/core/Maths/math.axis.js";
import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Space } from "@babylonjs/core/Maths/math.axis.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

export class Block {
    positions: Vector3[];
    parentCube!: Mesh;
    cubes: Mesh[]; // Child cubes - for uncoupling/recoupling
    type!: string;
    scene: Scene;
    private _isActive: boolean;

    constructor(cubeNum: number, scene: Scene) {
        // true when block is falling (1st contructed), false when locked in
        // or false if block not in grid (when first being spawned), true if in grid and falling
        this._isActive = true;
        this.positions = new Array(cubeNum);
        this.cubes = new Array(cubeNum - 1); // excluding parent cube
        this.scene = scene;
    }

    createCube(ypos: number, xpos: number): Mesh {
        let cube = MeshBuilder.CreateBox("box", { size: 1 }, this.scene); // will scene need to be stored?
        cube.position.y = ypos; // 5.5 or 6.5?, or higher, above grid?
        cube.position.x = xpos;
        cube = this.createEdges(cube);

        return cube;
    }

    // for meshes && instanced meshes
    private createEdges(cube: any): any {
        cube.enableEdgesRendering();
        cube.edgesWidth = 5.0;
        cube.edgesColor = new Color4(0, 0, 0, 1); // black edges
        return cube;
    }

    // Position of block based on parent block, used for moving.
    get position(): Vector3 {
        // May not be accurate for pivoted blocks - specific to each class?
        return this.parentCube.position;
    }

    // If hasPivot - rotate around pivot instead (parent sphere)
    rotate(axis: string, rotation: number) {
        if (this.type !== "big cube") {
            switch (axis) {
                case "x":
                    this.parentCube.rotate(Axis.X, rotation, Space.WORLD);
                    break;
                case "y":
                    this.parentCube.rotate(Axis.Y, -rotation, Space.WORLD);
                    break;
                case "z":
                    this.parentCube.rotate(Axis.Z, -rotation, Space.WORLD);
                    break;
            }
        }
    }

    becomeChild(cube: Mesh) {
        // cube = this.parentCube.createInstance("cube");
        cube = this.parentCube.clone();
        cube = this.createEdges(cube);
        // cube.parent = this.parentCube;
        return cube;
    }

    uncouple() {
        // Remove link between child and parent
        // each cube that makes up block will uncouple
        for (let i = 0; i < this.cubes.length; i++) {
            this.cubes[i].setParent(null);
        }
    }

    set isActive(state: boolean) {
        this._isActive = state;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    getPositions() {
        return this.positions;
    }

    getRelPos() {
        return this.positions;
    }
}
