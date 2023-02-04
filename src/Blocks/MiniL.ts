import {
    Color3,
    Mesh,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import { Block } from "./Block";

/**
 * Small L-Block, 2 x 2,
 * drawn with top right corner, y = 6.5
 */
export class MiniL extends Block {
    private _cube2!: Mesh;
    private _cube3!: Mesh;

    constructor(scene: Scene) {
        super(3, scene);
        this.type = "mini l";
        this.create();
        this.setCubes();
    }

    private create(): void {
        this.parentCube = this.createCube(6.5, -1); // left-most, top

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(1, 0.2, 0.3);
        mat.emissiveColor = new Color3(1, 0.2, 0.3); // Light red
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;

        this._cube2 = this.becomeChild(this._cube2);
        this._cube3 = this.becomeChild(this._cube3);

        this._cube2.parent = this.parentCube;
        this._cube2.position = new Vector3(0, -1, 0); // left-most, bottom

        this._cube3.parent = this.parentCube;
        this._cube3.position = new Vector3(1, 0, 0); //right, top
    }

    getPositions() {
        return [
            this.parentCube.position,
            this._cube2.getAbsolutePosition(),
            this._cube3.getAbsolutePosition()
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
            this._cube3.position
        ];
    }

    private setCubes() {
        this.cubes = [this._cube2, this._cube3];
    }
}
