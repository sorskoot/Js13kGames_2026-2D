// Rainbow Merge — a tiny 2048-with-colors game.
// 10 tiers: Red→Orange→Yellow→Lime→Green→Teal→Blue→Indigo→Violet→UNICORN.

import { Board } from './board.js';
import { GameUI } from './game-ui.js';
import { InputController } from './input-controller.js';
import { Renderer } from './renderer.js';
import type { Direction } from './game-data.js';

class Game {
    private readonly board = new Board();
    private readonly renderer: Renderer;
    private readonly ui: GameUI;
    private dead = false;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.ui = new GameUI(this.newGame);
        new InputController(canvas, this.move);
        addEventListener('resize', () => this.renderer.layout());

        this.renderer.layout();
        this.ui.buildLegend();
        this.newGame();
        this.draw();
    }

    private readonly newGame = (): void => {
        this.board.reset();
        this.dead = false;
        this.renderer.reset();
        this.addTile();
        this.addTile();
        this.ui.updateScore(this.board.score);
        this.ui.hideOverlay();
    };

    private addTile(): void {
        const coordinates = this.board.addTile();
        if (coordinates) {
            this.renderer.spawnTile(coordinates);
        }
    }

    private readonly move = (direction: Direction): void => {
        if (this.dead) {
            return;
        }
        const result = this.board.move(direction);
        if (!result) {
            return;
        }
        this.renderer.animateMove(
            result.movements,
            result.merges,
            this.board.grid,
        );
        this.ui.updateScore(this.board.score);
        setTimeout(() => {
            this.addTile();
            if (this.board.won && !this.ui.overlayShown) {
                this.ui.showWin(this.board.score);
                this.renderer.celebrate(this.board.grid);
            } else if (!this.board.hasMoves()) {
                this.dead = true;
                this.ui.showDead(this.board.score);
            }
        }, 90);
    };

    private readonly draw = (): void => {
        this.renderer.draw(this.board.grid);
        requestAnimationFrame(this.draw);
    };
}

new Game(document.querySelector<HTMLCanvasElement>('#canvas')!);
