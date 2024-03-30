import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { Block } from "./Block.js";

/**
 * Z-Block, 3 x 2
 * drawn in the shape of z, y = 5.5
 */
export class ZBlock extends Block {
    private _cube2!: Mesh;
    private _cube3!: Mesh;
    private _cube4!: Mesh;

    constructor(scene: Scene) {
        super(4, scene);
        this.type = "z block";
        this.create();
        this.setCubes();
    }

    private create(): void {
        this.parentCube = this.createCube(5.5, 0); // Bottom middle

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = Color3.Purple();
        mat.emissiveColor = new Color3(0.4, 0.28, 0.8); // Purple
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;

        this._cube2 = this.becomeChild(this._cube2);
        this._cube3 = this.becomeChild(this._cube3);
        this._cube4 = this.becomeChild(this._cube4);

        this._cube2.parent = this.parentCube;
        this._cube2.position = new Vector3(1, 0, 0); // Right, bottom

        this._cube3.parent = this.parentCube;
        this._cube3.position = new Vector3(0, 1, 0); // Middle, top

        this._cube4.parent = this.parentCube;
        this._cube4.position = new Vector3(-1, 1, 0); // Left, top
    }

    getPositions() {
        // Absolute pos instead of uncouple(), using uncouple only once block lands
        return [
            this.parentCube.position,
            this._cube2.getAbsolutePosition(),
            this._cube3.getAbsolutePosition(),
            this._cube4.getAbsolutePosition(),
        ];
    }

    getRelPos() {
        this.setPositions();
        return this.positions;
    }

    private setPositions() {
        this.positions = [
            this.parentCube.position,
            this._cube2.position,
            this._cube3.position,
            this._cube4.position,
        ];
    }

    private setCubes() {
        this.cubes = [this._cube2, this._cube3, this._cube4];
    }
}
