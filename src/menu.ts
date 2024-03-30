import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Control } from "@babylonjs/gui/2D/controls/control.js";
import { Line } from "@babylonjs/gui/2D/controls/line.js";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock.js";

export class Menu {
    public _advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    private _titleFront: TextBlock;
    private _titleBack: TextBlock;
    private _authors: TextBlock;
    private _line: Line;
    private _font: string;
    private _start: TextBlock;

    constructor() {
        this._font = "Agency FB";

        this._start = new TextBlock("start");
        this._start.text = "C L I C K    A N Y W H E R E    T O    S T A R T";
        this._start.color = "white";
        this._start.fontFamily = this._font;
        this._start.textHorizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._start.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._start.fontSize = 30;
        this._start.top = 25;
        this._advancedTexture.addControl(this._start);

        this._titleBack = new TextBlock("titleFront");
        this._titleBack.text = "3D Tetris";
        var color = new Color3(0.2, 0.28, 1);
        this._titleBack.color = color.toHexString();
        this._titleBack.fontSize = 275;
        this._titleBack.fontFamily = this._font;
        this._titleBack.textVerticalAlignment =
            Control.VERTICAL_ALIGNMENT_CENTER;
        this._titleBack.textHorizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._titleBack.top = -240;
        this._titleBack.left = -10;
        this._advancedTexture.addControl(this._titleBack);

        this._titleFront = new TextBlock("titleFront");
        this._titleFront.text = "3D Tetris";
        this._titleFront.color = "white";
        this._titleFront.fontSize = 275;
        this._titleFront.fontFamily = this._font;
        this._titleFront.textVerticalAlignment =
            Control.VERTICAL_ALIGNMENT_CENTER;
        this._titleFront.textHorizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._titleFront.top = -250;
        this._titleBack.left = 10;
        this._advancedTexture.addControl(this._titleFront);

        this._authors = new TextBlock("authors");
        this._authors.text =
            "b  y     A  n  n  a     J  o     a  n  d     R  J";
        this._authors.color = "white";
        this._authors.fontFamily = this._font;
        this._authors.fontSize = 50;
        this._authors.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._authors.textHorizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._authors.top = -75; // 100
        this._advancedTexture.addControl(this._authors);

        this._line = new Line();
        this._line.color = "white";
        this._line.lineWidth = 20;
        this._line.x1 = 0;
        this._line.y1 = 575;
        this._line.x2 = 2000;
        this._line.y2 = 575;
        this._line.alpha = 0.2;
        this._advancedTexture.addControl(this._line);
    }

    hide() {
        this._titleFront.dispose();
        this._titleBack.dispose();
        this._authors.dispose();
        this._start.dispose();
        this._line.dispose();
    }
}
