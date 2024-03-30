import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

import { Block } from "./Block.js";

/**
 * 1 x 4 Long Block
 * drawn upright, y = 6.5
 */
export class BigTower extends Block {
    private _cube2!: Mesh;
    private _cube3!: Mesh;
    private _cube4!: Mesh;

    constructor(scene: Scene) {
        super(4, scene);
        this.type = "big tower";
        this.create();
        this.setCubes();
    }

    private create(): void {
        this.parentCube = this.createCube(6.5, 0); // 2nd cube from bottom

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(0, 0.5, 0.5);
        mat.emissiveColor = new Color3(0.5, 1, 0.2); // Green
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;

        this._cube2 = this.becomeChild(this._cube2);
        this._cube3 = this.becomeChild(this._cube3);
        this._cube4 = this.becomeChild(this._cube4);

        this._cube2.parent = this.parentCube;
        this._cube2.position.y = 2;

        this._cube3.parent = this.parentCube;
        this._cube3.position.y = 1;

        this._cube4.parent = this.parentCube;
        this._cube4.position.y = -1;
    }

    getPositions() {
        // After using this method while active block, must recouple!!!
        return [
            this.parentCube.position,
            this._cube2.getAbsolutePosition(),
            this._cube3.getAbsolutePosition(),
            this._cube4.getAbsolutePosition(),
        ];
    }

    getRelPos() {
        this.setPositions();
        // gives relative positions (because cubes still parented), except can't get rel pos of parent cube...
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

    private setCubes(): void {
        this.cubes = [this._cube2, this._cube3, this._cube4];
    }
}
