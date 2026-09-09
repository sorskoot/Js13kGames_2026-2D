import {Board} from './board.js';
import {GameUI} from './game-ui.js';
import {InputController} from './input-controller.js';
import {Renderer} from './renderer.js';
import type {Direction} from './game-data.js';
import {MOVE_DURATION} from './game-data.js';

class Game {
    private readonly board = new Board();
    private readonly renderer: Renderer;
    private readonly ui: GameUI;
    private dead = false;
    private busy = false;
    private winShown = false;
    private moveTimer = 0;
    private winTimer = 0;

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
        clearTimeout(this.moveTimer);
        clearTimeout(this.winTimer);
        this.board.reset();
        this.dead = false;
        this.busy = false;
        this.winShown = false;
        this.renderer.reset();
        this.ui.reset();
        this.addTile();
        this.addTile();
        this.ui.updateScore(this.board.score);
        this.ui.updateJourney(this.board.grid);
    };

    private addTile(): void {
        const coordinates = this.board.addTile();
        if (coordinates) {
            this.renderer.spawnTile(coordinates);
        }
    }

    private readonly move = (direction: Direction): void => {
        if (this.dead || this.busy || this.ui.overlayShown) {
            return;
        }
        const result = this.board.move(direction);
        if (!result) {
            return;
        }
        this.busy = true;
        this.renderer.animateMove(result.movements, result.merges, this.board.grid);
        this.ui.updateScore(this.board.score);
        this.moveTimer = window.setTimeout(() => {
            this.addTile();
            this.ui.updateJourney(this.board.grid);
            this.ui.showCombo(
                result.merges.length,
                Math.max(0, ...result.merges.map(([row, column]) => this.board.grid[row][column]))
            );
            this.busy = false;
            if (this.board.won && !this.winShown) {
                this.winShown = true;
                this.busy = true;
                this.renderer.celebrate(this.board.grid);
                this.winTimer = window.setTimeout(
                    () => {
                        this.busy = false;
                        this.dead = !this.board.hasMoves();
                        this.ui.showWin(this.board.score, !this.dead);
                    },
                    matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500
                );
            } else if (!this.board.hasMoves()) {
                this.dead = true;
                this.ui.showDead(this.board.score);
            }
        }, MOVE_DURATION + 150);
    };

    private readonly draw = (): void => {
        this.renderer.draw(this.board.grid);
        requestAnimationFrame(this.draw);
    };
}

new Game(document.querySelector<HTMLCanvasElement>('#canvas')!);
