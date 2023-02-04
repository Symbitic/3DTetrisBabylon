import { KeyboardEventTypes, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

import { BigCube } from "./Blocks/BigCube";
import { BigL } from "./Blocks/BigL";
import { BigTower } from "./Blocks/BigTower";
import { Block } from "./Blocks/Block";
import { Cube } from "./Blocks/Cube";
import { MiniL } from "./Blocks/MiniL";
import { ShortTower } from "./Blocks/ShortTower";
import { TBlock } from "./Blocks/TBlock";
import { ZBlock } from "./Blocks/ZBlock";
import { GameBoard } from "./GameBoard";

export class Game {
    public gameBoard: GameBoard;
    public block!: Block; // Stores current active block
    public collided: boolean;
    public colpt!: Vector3;
    private _landed: Mesh[]; // Landed (inactive) blocks stored as cubes (uncoupled); if collided -> space = true
    private _rotation: number;
    public fallingInterval: any;
    public scene: Scene;
    public gameOver: boolean;
    private _score: TextBlock;
    public scoreCount: number; // Whenever a layer cleared = 49 pts (7x7)

    constructor(size: number, scene: Scene) {
        this.scene = scene;
        this.gameBoard = new GameBoard(size, scene); //7 or 5
        this.collided = false;
        this.enableControls();
        this._landed = new Array();
        this._rotation = Math.PI / 2;
        this.gameOver = false;
        this.scoreCount = 0;

        this._score = new TextBlock("score");
        this._score.text = "Score : " + this.scoreCount;
        this._score.fontFamily = "Agency FB";
        this._score.color = "white";
        this._score.fontSize = 50;
        this._score.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._score.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._score.left = -20;
        this._score.top = 20;
        AdvancedDynamicTexture.CreateFullscreenUI("UI").addControl(this._score);

        // Loop for drawing block...
        this.drawBlock();

        scene.registerBeforeRender(() => {
            if (this.gameOver) {
                clearInterval(this.fallingInterval);
            }
            if (this.collided) {
                clearInterval(this.fallingInterval);
                this.setLanded();
                this.checkFullLayer();

                if (!this.isGameOver()) {
                    this.collided = false;
                    this.drawBlock();
                }
            }
        });
    }

    drawBlock() {
        // After 1st block drawn, spawn a random block whenever a block lands/collides
        // draw block without hitting other blocks - start height above grid (!ingrid), only update spaces arr if inside grid & active

        // TODO: randomize even more
        const random = Math.floor(Math.random() * 8); // generates numbers from 0-7

        // Limitation: can only move block once fully in grid, but can rotate outside of grid
        switch (random) {
            case 0:
                this.block = new Cube(this.scene);
                break;
            case 1:
                this.block = new ShortTower(this.scene); // Collapsing X Rotation
                break;
            case 2:
                this.block = new BigTower(this.scene); // Acts as if already collided when spawned?
                break;
            case 3:
                this.block = new MiniL(this.scene); // X collapse
                break;
            case 4:
                this.block = new BigL(this.scene);
                break;
            case 5:
                this.block = new BigCube(this.scene);
                break;
            case 6:
                this.block = new TBlock(this.scene);
                break;
            case 7:
                this.block = new ZBlock(this.scene);
                break;
        }

        this.checkCollision();

        this.fallingInterval = setInterval(() => {
            if (this.gameBoard.inGrid(this.block.getPositions()) === false && this.gameBoard.canMove(this.inGridPositions(), "down") === false) {
                this.gameOver = true;
            }
            if (this.gameBoard.inGrid(this.block.getPositions()) === false) {
                // For when block first spawned
                this.fixRotationOffset();
                this.block.position.y -= 1;
            } else if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "down") === false) {
                this.collided = true;
            } else if (this.gameBoard.inGrid(this.block.getPositions()) && this.checkCollision() === false && this.gameBoard.canMove(this.block.getPositions(), "down")) {
                this.block.position.y -= 1;
                this.fixRotationOffset();
                this.gameBoard.updateSpaces(this.block.getPositions(), true, false);
            }
        }, 1250);

    }

    // Get positions in the grid - for falling interval
    private inGridPositions() {
        const allpos: Vector3[] = this.block.getPositions();
        const gridpos: Vector3[] = new Array(); //create an array without reference to allpos array

        for (let i = 0; i < allpos.length; i++) {
            if (this.gameBoard.inGrid([allpos[i]])) {
                gridpos.push(allpos[i]);
            }
        }
        return gridpos;
    }

    private fixRotationOffset(): void {
        // RESOLVED: rotated blocks caused block positions to store irrational number values
        // offset positions - unable to track, related to parent cube and uncoupling
        // when block rotated, cubes, not parentCube, get shifted by really small +/- decimals
        // parentCube doesn't have a relative position, only cubes

        const fixpos = this.block.getRelPos();

        for (let i = 0; i < fixpos.length; i++) {
            if (Math.abs(fixpos[i].x) > 0 && Math.abs(fixpos[i].x) < 0.1) {
                fixpos[i].x = Math.floor(Math.abs(fixpos[i].x));
            }
            if (Math.abs(fixpos[i].y) > 0 && Math.abs(fixpos[i].y) < 0.1) {
                fixpos[i].y = Math.floor(Math.abs(fixpos[i].y));
            }
            if (Math.abs(fixpos[i].z) > 0 && Math.abs(fixpos[i].z) < 0.1) {
                fixpos[i].z = Math.floor(Math.abs(fixpos[i].z));
            }
        }
    }

    // If block is landed/collided ON GROUND
    private checkCollision() {
        // either y = 11 (ground lvl)(height -1), or block right on top of another mesh (y+1 -> space = true)
        const groundlvl = this.gameBoard.groundlvl;
        let groundtrack = 0;

        for (let i = 0; i < this.block.getPositions().length; i++) {
            if (this.block.getPositions()[i].y === groundlvl) {
                groundtrack++;
            }
        }

        if (groundtrack > 0) {
            this.collided = true;
            return true;
        }
        return false;
    }

    // Store cubes into landed array
    private setLanded(): void {
        // MUST HAVE - IMPORTANT - without it landed array contains unrounded off decimals (from rotations)
        this.block.uncouple();
        this.block.parentCube.computeWorldMatrix();

        for (let c = 0; c < this.block.cubes.length; c++) {
            this.block.cubes[c].computeWorldMatrix();
        }
        this.fixRotationOffset();

        if (this.block.type === "cube") {
            this._landed.push(this.block.parentCube);
        } else if (this.block.type !== "cube") {
            for (let i = 0; i < this.block.cubes.length; i++) {
                this._landed.push(this.block.cubes[i]);
            }
            this._landed.push(this.block.parentCube);
        }

        // Store landed block's positions to updateSpaces
        const arr = new Array();
        for (let el = 0; el < this._landed.length; el++) {
            arr.push(this._landed[el].position);  // abs pos?
        }

        this.gameBoard.updateSpaces(arr, false, true);
    }

    // Check for any filled up layer, not just for bottom layer
    private checkFullLayer(): void {
        const height = this.gameBoard.height;
        const size = this.gameBoard.size;

        let fullLayer: boolean;
        let layerNums: number[] = new Array(); // Which layers are cleared? .length = 0 if no full layers
        let layerheight = 0;

        // Single layer - same y coordinate
        for (let y = 0; y < height; y++) {
            fullLayer = true;
            for (let x = 0; x < size; x++) {
                for (let z = 0; z < size; z++) {
                    if (this.gameBoard.spaces[x][y][z] === false) {
                        fullLayer = false;
                    } else {
                        layerheight = (this.gameBoard.positions as any)[x][y][z].y;
                    }
                }
            }

            // Clear everytime you encounter full layer.
            if (fullLayer) {
                this.clearLayer(y, layerheight, size);
                if (y !== 0) {
                    // Stores which layers were cleared, used to collapse layers.
                    layerNums.push(y);
                }
                this.scoreCount += size * size;
                this.updateScore(this.scoreCount);
                fullLayer = false;
            }
        }

        // Collpase only if full layers exist and were cleared - when layerNums has > 0 elements
        if (layerNums.length > 0) {
            this.collapseLayers(layerNums, size, height);
        }
    }

    private clearLayer(layer: number, layerheight: number, size: number) {
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                this.gameBoard.spaces[x][layer][z] = false;
            }
        }

        this.scene.blockfreeActiveMeshesAndRenderingGroups = true; // For optimization
        for (let i = 0; i < this._landed.length; i++) {
            const position = this._landed[i].position;
            if (position.y === layerheight) {
                this._landed[i].dispose();
                (this._landed as any)[i] = null;
            }
        }
        this.scene.blockfreeActiveMeshesAndRenderingGroups = false;

        // Delete landed elements that have been disposed
        for (let j = this._landed.length - 1; j >= 0; j--) {
            if (this._landed[j] === null) {
                this._landed.splice(j, 1);
            }
        }
    }

    private collapseLayers(layerNums: number[], size: number, height: number) {
        let y = layerNums[layerNums.length - 1] - 1;
        let layer = y + 1;

        const landedPos = new Array();
        for (let el = 0; el < this._landed.length; el++) {
            landedPos.push(this._landed[el].position);
        }

        for (y; y >= 0; y--) {
            for (let x = 0; x < size; x++) {
                for (let z = 0; z < size; z++) {

                    for (let i = 0; i < landedPos.length; i++) {
                        // See if position in landed same as in position arr in gameboard - should only find 1 match at this xyz
                        if (this.gameBoard.compare(landedPos[i], x, y, z) === true) {
                            layer = y + 1;

                            while (layer < height && this.gameBoard.spaces[x][layer][z] === false) {
                                landedPos[i].y--;
                                layer++;
                            }
                        }
                    }
                }
            }
            // Update after entire y plane of cubes shifted down.
            this.gameBoard.updateSpaces(landedPos, false, true);
        }
    }

    private enableControls() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (this.gameBoard.inGrid(this.block.getPositions())) {
                this.fixRotationOffset();
                this.checkCollision(); //&& this.gameBoard.inGrid(this.block.getPositions())
            }
            //keyboard actions
            if (!this.collided && !this.gameOver) { //when block 1st drawn, outside of grid (!inGrid), can only rotate
                this.fixRotationOffset();
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        switch (kbInfo.event.key) {
                            case "w":
                                // Forward
                                if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "forward")) {
                                    this.block.position.z += 1;
                                }
                                break;

                            case "s":
                                // Backward
                                if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "back")) {
                                    this.block.position.z -= 1;
                                }
                                break;

                            case "a":
                                // Left
                                if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "left")) {
                                    this.block.position.x -= 1;
                                }
                                break;

                            case "d":
                                // Right
                                if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "right")) {
                                    this.block.position.x += 1;
                                }
                                break;

                            case " ":
                                // Down
                                //TO FIX: press space bar continuously - canMove not called fast enough, meshes intersect
                                if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "down")) {
                                    this.block.position.y -= 1;
                                } else if (this.gameBoard.inGrid(this.block.getPositions()) && this.gameBoard.canMove(this.block.getPositions(), "down") === false) {
                                    this.collided = true;
                                }
                                break;

                            case "z":
                                this.block.rotate("x", this._rotation);
                                this.fixRotationOffset();
                                break;

                            case "x":
                                this.block.rotate("y", this._rotation);
                                this.fixRotationOffset();
                                break;

                            case "c":
                                this.block.rotate("z", this._rotation);
                                this.fixRotationOffset();
                                break;
                        }

                        this.fixRotationOffset();
                        this.gameBoard.updateSpaces(this.block.getPositions(), true, false);
                        break;
                }
            }
        });
    }

    private updateScore(score: number) {
        this._score.text = "Score : " + score;
    }

    isGameOver() {
        const size = this.gameBoard.size;
        const height = this.gameBoard.height;
        const top = (height / 2) - 0.5;

        //array of positions of block that just spawned
        const spawnPos: Vector3[] = this.block.getPositions();
        const clonedPos: Vector3[] = JSON.parse(JSON.stringify(spawnPos)); // Deep clone - no reference to getPositions (spawnPos)
        //if any of the block's positions (at y = 5.5) are right above another block -> gameover (like a can't move func)
        //check all positions right below each cube that makes up block (at y = 4.5)

        // Find positions of block 1 below
        const posBelow: Vector3[] = new Array();

        for (let i = 0; i < clonedPos.length; i++) {
            if (clonedPos[i].y === top) { // top + 1
                const vector = new Vector3(clonedPos[i].x, clonedPos[i].y - 1, clonedPos[i].z);
                posBelow.push(vector);
            }
        }

        //compare spaces at y = 5.5 to y = 4.5 (same x and z)
        let tracker = 0;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = 0; z < size; z++) {

                    for (let i = 0; i < posBelow.length; i++) {
                        if (this.gameBoard.compare(posBelow[i], x, y, z)) {
                            if (this.gameBoard.spaces[x][y][z] === true) {
                                tracker++;
                            }
                        }
                    }
                }
            }
        }

        if (tracker > 0) {
            this.gameOver = true;
            return true;
        }

        return false;
    }
}
