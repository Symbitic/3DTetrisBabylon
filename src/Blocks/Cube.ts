import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

import { Block } from "./Block.js";

/**
 * 1 x 1 Cube Block
 * drawn at height y = 6.5
 */
export class Cube extends Block {
    constructor(scene: Scene) {
        super(1, scene); // 1 - size of pos array
        this.type = "cube";
        this.create();
    }

    private create() {
        this.parentCube = this.createCube(6.5, 0);

        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(0.6, 0.6, 0);
        mat.emissiveColor = Color3.Yellow();
        this.parentCube.material = mat;
        this.parentCube.material.backFaceCulling = false;
    }

    // Retrieve positions at a given time - whenever updateSpaces in Game is called
    getPositions() {
        this.setPositions();
        return this.positions;
    }

    private setPositions() {
        this.positions = [this.parentCube.position];
    }
}
