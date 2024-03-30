/// <reference types="vite/types/import-meta" />
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { Menu } from "./menu.js";
import { Game } from "./game.js";
import { GameOver } from "./gameover.js";

import "@babylonjs/core/Helpers/sceneHelpers.js";
import "@babylonjs/core/Materials/standardMaterial.js";
import "@babylonjs/core/Rendering/edgesRenderer.js";

class App {
    private _scene: Scene;
    private _engine: Engine;
    private _canvas: HTMLCanvasElement;
    private _menu!: Menu;
    private _game!: Game;
    private _gameOver: boolean;
    private _endScreen!: GameOver;
    private _score: number;

    constructor() {
        // create canvas, scene (has gameboard), engine?
        this._canvas = document.getElementById(
            "renderCanvas",
        ) as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0, 0, 0, 1);

        window.addEventListener("resize", () => {
            this._engine.resize();
        });

        this._gameOver = false;
        this._score = 0;
        this.createScene(this._scene);
    }

    private createScene(scene: Scene) {
        // Camera changed
        const camera = new ArcRotateCamera(
            "Camera",
            -Math.PI / 2,
            Math.PI / 3.3,
            18.4,
            new Vector3(0, 0, 0),
            scene,
        );
        camera.attachControl(this._canvas, true);

        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene,
        );
        light.intensity = 1;

        if (this._gameOver) {
            scene.clearColor = new Color4(0, 0, 0, 0);
            this._endScreen = new GameOver(this._score);
            let pointerDown = scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN:
                        scene.onPointerObservable.remove(pointerDown);
                        this._endScreen.hide();
                        this._gameOver = false;
                        this._game = new Game(7, scene);
                        scene.registerBeforeRender(() => {
                            if (this._game.gameOver) {
                                this._gameOver = true;
                                this._score = this._game.scoreCount;
                            }
                        });
                        break;
                }
            });
        } else {
            this._menu = new Menu();

            let pointerDown = scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN:
                        scene.onPointerObservable.remove(pointerDown);
                        this._menu.hide();
                        this._game = new Game(7, scene);
                        scene.registerBeforeRender(() => {
                            if (this._game.gameOver) {
                                this._gameOver = true;
                                this._score = this._game.scoreCount;
                            }
                        });
                        break;
                }
            });
        }
    }

    async start() {
        if (import.meta.env.DEV) {
            try {
                await import("@babylonjs/core/Debug/debugLayer");
                await import("@babylonjs/inspector");
                // Hide/show the Inspector
                window.addEventListener("keydown", (evt) => {
                    // Ctrl+I
                    if (evt.ctrlKey && !evt.shiftKey && evt.key === "i") {
                        if (this._scene.debugLayer.isVisible()) {
                            this._scene.debugLayer.hide();
                        } else {
                            this._scene.debugLayer.show();
                        }
                        evt.preventDefault();
                    }
                });
            } catch (e: any) {
                console.log(`Failed to load inspector: ${e.message}`);
            }
        }

        this._engine.runRenderLoop(() => {
            if (!this._gameOver) {
                this._scene.render();
            } else if (this._gameOver) {
                this._menu._advancedTexture.dispose();
                this._scene.dispose();
                var scene2 = new Scene(this._engine);
                this.createScene(scene2);
                this._scene = scene2; // Needed?
                scene2.render();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.start();
});
