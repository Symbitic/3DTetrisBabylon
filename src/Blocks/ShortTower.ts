import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

import { Block } from "./Block.js";

/**
 * 1 x 3 Short Block
 * drawn upright, top to bottom, y = 6.5
 */
export class ShortTower extends Block {
    private _cube2!: Mesh; // Top cube
    private _cube3!: Mesh; // Bottom cube

    constructor(scene: Scene) {
        super(3, scene);
        this.type = "short tower";
        this.create();
        this.setCubes();
    }

    private create(): void {
        this.parentCube = this.createCube(6.5, 0);

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(0, 1, 1);
        mat.emissiveColor = new Color3(0, 1, 1); // Light blue
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;

        this._cube2 = this.becomeChild(this._cube2);
        this._cube3 = this.becomeChild(this._cube3);

        this._cube2.parent = this.parentCube;
        this._cube2.position.y = 1; // Position relative to parent

        this._cube3.parent = this.parentCube;
        this._cube3.position.y = -1;
    }

    getPositions() {
        return [
            this.parentCube.position,
            this._cube2.getAbsolutePosition(),
            this._cube3.getAbsolutePosition(),
        ];
    }

    getRelPos() {
        this.setPositions();
        return this.positions;
    }

    private setPositions() {
        // 1st element stores parent block's pos:
        this.positions = [
            this.parentCube.position,
            this._cube2.position,
            this._cube3.position,
        ];
    }

    private setCubes() {
        this.cubes = [this._cube2, this._cube3];
    }
}
