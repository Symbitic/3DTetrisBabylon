import {
    Color3,
    Mesh,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import { Block } from "./Block";

/**
 * Big L-Block, 2 x 3,
 * drawn top up, y = 5.5
 */
export class BigL extends Block {
    private _cube2!: Mesh;
    private _cube3!: Mesh;
    private _cube4!: Mesh;

    constructor(scene: Scene) {
        super(4, scene);
        this.type = "big l";
        this.create();
        this.setCubes();
    }

    private create() {
        this.parentCube = this.createCube(5.5, 0); // middle, bottom cube

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(0.4, 0.28, 1);
        mat.emissiveColor = new Color3(1, 0.28, 1); // Pink
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;

        this._cube2 = this.becomeChild(this._cube2);
        this._cube3 = this.becomeChild(this._cube3);
        this._cube4 = this.becomeChild(this._cube4);

        this._cube2.parent = this.parentCube;
        this._cube2.position = new Vector3(-1, 0, 0); //left, bottom

        this._cube3.parent = this.parentCube;
        this._cube3.position = new Vector3(-1, 1, 0); //left, top

        this._cube4.parent = this.parentCube;
        this._cube4.position = new Vector3(1, 0, 0); //right, bottom
    }

    getPositions() {
        return [
            this.parentCube.position,
            this._cube2.getAbsolutePosition(),
            this._cube3.getAbsolutePosition(),
            this._cube4.getAbsolutePosition()
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
            this._cube4.position
        ];
    }

    private setCubes() {
        this.cubes = [
            this._cube2,
            this._cube3,
            this._cube4
        ];
    }
}
