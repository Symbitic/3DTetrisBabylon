import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

export class GameBoard {
    private _size: number;
    private _height!: number;
    private _ground!: Mesh;
    private _spaces!: any[];
    private _positions!: Vector3[];
    private _groundlvl!: number;
    private _scene: Scene;

    constructor(size: number, scene: Scene) {
        this._size = size;
        this.create();
        this.fillSpaces();
        this.fillPositions();
        this._scene = scene;
    }

    private create() {
        const groundGrid = this.createGrid();
        groundGrid.backFaceCulling = false;

        // Size: must be odd number b/c of offset; use 5 or 7
        const ground = MeshBuilder.CreateGround(
            "ground",
            { width: this._size, height: this._size },
            this._scene,
        );
        ground.material = groundGrid;
        ground.position.y = this._size === 7 ? -6 : -5;
        this._groundlvl = ground.position.y + 0.5;
        this._ground = ground;

        // Front & back planes
        this.createPlane(0, 0, -this._size / 2, Math.PI);
        this.createPlane(0, 0, this._size / 2, 0);

        // Right & left planes
        this.createPlane(this._size / 2, 0, 0, Math.PI / 2);
        this.createPlane(-this._size / 2, 0, 0, -Math.PI / 2);
    }

    private createGrid() {
        const grid = new GridMaterial("grid", this._scene);
        grid.lineColor = Color3.White();
        grid.majorUnitFrequency = 1;
        grid.opacity = 0.85;
        grid.gridOffset = new Vector3(0.5, 0, 0.5);
        return grid;
    }

    private createPlane(x: number, y: number, z: number, rotation: number) {
        // 12 if 7, 10 if 5 (default)
        this._height = this._size === 7 ? 12 : 10;
        const plane = MeshBuilder.CreatePlane(
            "plane",
            { height: this._height, width: this._size },
            this._scene,
        );
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = z;
        plane.rotation.y = rotation;

        const planeGrid = this.createGrid();
        planeGrid.backFaceCulling = true;
        plane.material = planeGrid;

        return plane;
    }

    get size() {
        return this._size;
    }

    get height() {
        return this._height;
    }

    get ground() {
        return this._ground;
    }

    get groundlvl() {
        return this._groundlvl;
    }

    private fillSpaces() {
        const spaces = new Array(this._size); // x - length

        // Fill x empty arrays w/ y-arrays
        for (let x = 0; x < this._size; x++) {
            spaces[x] = new Array(this._height); // y - height

            // Fill y arrs w/ z-arrs
            for (let y = 0; y < this._height; y++) {
                spaces[x][y] = new Array(this._size); //z - width

                // Fill z-arrs w/z # of elements
                for (let z = 0; z < this._size; z++) {
                    // false - space/position not occupied
                    spaces[x][y][z] = false;
                }
            }
        }

        this._spaces = spaces;
    }

    get spaces() {
        return this._spaces;
    }

    private fillPositions() {
        // Define an origin vector: //x, y, z at [0][0][0]
        // for odd size and even height, shifted 0.5 up y

        // Top, right, deep corner
        const origin = new Vector3(
            -Math.floor(this._size / 2),
            this._height / 2 - 0.5,
            Math.floor(this._size / 2),
        );

        // y+=1 -> down y coord; z+=1 -> down z coord; x+=1 -> up 1 x coord
        const positions = new Array(this._size);
        let xpos = origin.x;

        for (let x = 0; x < this._size; x++) {
            positions[x] = new Array(this._height);
            let ypos = origin.y;

            for (var y = 0; y < this._height; y++) {
                positions[x][y] = new Array(this._size);
                var zpos = origin.z;

                for (var z = 0; z < this._size; z++) {
                    positions[x][y][z] = new Vector3(xpos, ypos, zpos);
                    zpos--;
                }
                ypos--;
            }
            xpos++;
        }

        this._positions = positions;
    }

    get positions() {
        return this._positions;
    }

    // Pass in block's position array; use w/dummy
    inGrid(blockpos: Vector3[]) {
        let inBounds: boolean;
        let tracker = 0; // Tracks if inBounds was ever true

        for (let x = 0; x < this._size; x++) {
            for (let y = 0; y < this._height; y++) {
                for (let z = 0; z < this._size; z++) {
                    for (let i = 0; i < blockpos.length; i++) {
                        inBounds = this.compare(blockpos[i], x, y, z);
                        if (inBounds) {
                            tracker++;
                        }
                        // If found one match, but others don't match any of positions, still out of grid
                    }
                }
            }
        }

        let tracker2 = 0;
        for (let i = 0; i < blockpos.length; i++) {
            if (
                Math.abs(blockpos[i].x) > Math.floor(this._size / 2) ||
                Math.abs(blockpos[i].y) > this._height / 2 - 0.5 ||
                Math.abs(blockpos[i].z) > Math.floor(this._size / 2)
            ) {
                tracker2++;
            }
        }

        if (tracker === blockpos.length || tracker2 === 0) {
            return true;
        }

        // Must only return false if blockpos doesnt match ANY els in POS ARRAY
        return false;
    }

    // To compare potential position of block
    canMove(blockpos: Vector3[], dir: string) {
        //to see if block can move or not (in a certain direction) - can it move to potential space?
        //dir: left - x -= 1, right - x += 1, forward - z += 1, backward - z -= 1, down - y -= 1

        const potential = JSON.parse(JSON.stringify(blockpos));

        let xstep = 0;
        let ystep = 0;
        let zstep = 0;

        switch (dir) {
            case "forward":
                zstep = 1;
                break;
            case "back":
                zstep = -1;
                break;
            case "right":
                xstep = 1;
                break;
            case "left":
                xstep = -1;
                break;
            case "down":
                ystep = -1;
                break;
        }

        for (let i = 0; i < potential.length; i++) {
            potential[i].x += xstep;
            potential[i].y += ystep;
            potential[i].z += zstep;
        }

        if (this.inGrid(potential) && !this.isOccupied(blockpos, potential)) {
            return true; // Call update spaces after block moves
        }

        return false;
    }

    // If using this method, must check if potential's position inGrid first
    isOccupied(current: Vector3[], potential: Vector3[]) {
        // Checks if any of positions of dummy block in conflict with spaces (at given xyz)

        // Find corresponding position (potential) of block in position array
        for (let x = 0; x < this._size; x++) {
            for (let y = 0; y < this._height; y++) {
                for (let z = 0; z < this._size; z++) {
                    // Current and potential arrays have same length - they store positions of same block
                    for (let i = 0; i < potential.length; i++) {
                        // Find position in potential non-overlapping w/current
                        // don't check spaces that block currently occupies, only check potential positions that block doesn't occupy.
                        if (
                            this.compareMultiple(current, x, y, z) === false &&
                            this.compare(potential[i], x, y, z) === true
                        ) {
                            // Position array el don't match any of current's els AND pos arr's el = potential el
                            if (this.spaces[x][y][z] === true) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        // If any space to be occupied by block already true - return true
        // If space isn't already occupied, return false
        return false;
    }

    // To track position of a block
    // in game: call updateSpaces whenever active block moves, when block collided/landed, or after layer shifted/collapsed (landed arr)
    updateSpaces(position: Vector3[], active: boolean, landed: boolean) {
        // For each active block - set a parent: get positions of each child block/cube (centers)

        // check positions array, dep on mesh
        for (let x = 0; x < this._size; x++) {
            for (let y = 0; y < this._height; y++) {
                for (let z = 0; z < this._size; z++) {
                    // Iterate through array of positions (active/landed cubes)
                    for (let i = 0; i < position.length; i++) {
                        // IF ACTIVE BLOCK -> SET POSITIONS TO NULL
                        if (
                            active &&
                            this.compare(position[i], x, y, z) === true
                        ) {
                            // Null used so that whenever active block moves, doesnt reset landed trues
                            this._spaces[x][y][z] = null;
                        }

                        // IF LANDED -> SET POSITIONS TO TRUE
                        if (
                            landed &&
                            this.compare(position[i], x, y, z) === true
                        ) {
                            // Even if space was null before (block active then landed)
                            this._spaces[x][y][z] = true;
                        }
                    }

                    // compareMultiple checks if each position (param[]) is same as xyz element in this._positions
                    // if not, each position isnt occupied, so space can be reset to false

                    // If not equal to any positions of block
                    if (
                        active &&
                        this._spaces[x][y][z] === null &&
                        this.compareMultiple(position, x, y, z) === false
                    ) {
                        // Reset space that was previously null - occupied by active block
                        this._spaces[x][y][z] = false;
                    }

                    if (
                        landed &&
                        this._spaces[x][y][z] === true &&
                        this.compareMultiple(position, x, y, z) === false
                    ) {
                        this._spaces[x][y][z] = false;
                    }

                    // Do nothing if block's position doesn't exist in positions array (out of grid, so ingrid=false)
                    // if block outside of grid, spaces set to false
                }
            }
        }
    }

    // is position of block same as in positions array?
    compare(position: Vector3, x: number, y: number, z: number) {
        const val: any = this._positions;
        const match =
            val[x][y][z].x === position.x &&
            val[x][y][z].y === position.y &&
            val[x][y][z].z === position.z;
        return match;
    }

    private compareMultiple(
        position: Vector3[],
        x: number,
        y: number,
        z: number,
    ) {
        let match: boolean;
        let tracker = 0;
        // If match ever equal true, return true (at least once=true)
        for (let i = 0; i < position.length; i++) {
            match = this.compare(position[i], x, y, z);
            if (match) {
                tracker++;
            }
        }
        if (tracker > 0) {
            return true;
        }
        return false;
    }
}
