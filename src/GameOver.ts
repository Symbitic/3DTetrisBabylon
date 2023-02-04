import {
    AdvancedDynamicTexture,
    Control,
    Line,
    TextBlock,
} from "@babylonjs/gui";

export class GameOver {
    _score: TextBlock;
    private _advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    private _titleFront: TextBlock;
    private _titleBack: TextBlock;
    private _line: Line;
    private _font: string;
    private _start: TextBlock;

    constructor(score: number) {
        this._font = "Agency FB";

        this._start = new TextBlock("start");
        this._start.text = "C L I C K    A N Y W H E R E    T O    P L A Y    A G A I N";
        this._start.color = "white";
        this._start.fontFamily = this._font;
        this._start.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._start.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._start.fontSize = 30;
        this._advancedTexture.addControl(this._start);

        this._titleBack = new TextBlock("titleFront");
        this._titleBack.text = "GAME OVER";
        this._titleBack.color = "purple";
        this._titleBack.fontSize = 275;
        this._titleBack.fontFamily = this._font;
        this._titleBack.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._titleBack.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._titleBack.top = -220;
        this._titleBack.left = -10;
        this._advancedTexture.addControl(this._titleBack);

        this._titleFront = new TextBlock("titleFront");
        this._titleFront.text = "GAME OVER";
        this._titleFront.color = "white";
        this._titleFront.fontSize = 275;
        this._titleFront.fontFamily = this._font;
        this._titleFront.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._titleFront.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._titleFront.top = -230;
        this._titleBack.left = 10;
        this._advancedTexture.addControl(this._titleFront);

        this._line = new Line();
        this._line.color = "white";
        this._line.lineWidth = 20;
        this._line.x1 = 0;
        this._line.y1 = 700;
        this._line.x2 = 2000;
        this._line.y2 = 700;
        this._line.alpha = 0.2;
        this._advancedTexture.addControl(this._line);

        this._score = new TextBlock("score");
        this._score.text = "Score : " + score;
        this._score.fontFamily = this._font;
        this._score.color = "white";
        this._score.fontSize = 50;
        this._score.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._score.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._score.left = 0;
        this._score.top = 150;
        this._advancedTexture.addControl(this._score);
    }

    hide() {
        this._titleFront.dispose();
        this._titleBack.dispose();
        this._start.dispose();
        this._line.dispose();
        this._score.dispose();
    }
}
