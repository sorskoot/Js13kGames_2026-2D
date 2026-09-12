import type { Direction } from './game-data.js';

/**
 * Converts keyboard and touch gestures into directional game moves.
 */
export class InputController {
    private touchX: number | null = null;
    private touchY: number | null = null;

    /**
     * Creates an input controller and registers keyboard and touch listeners.
     *
     * @param canvas - Game canvas on which swipe gestures are captured
     * @param onMove - Callback invoked with the requested movement direction
     */
    constructor(
        canvas: HTMLCanvasElement,
        onMove: (direction: Direction) => void,
    ) {
        addEventListener('keydown', (event) => {
            const directions: Partial<Record<string, Direction>> = {
                ArrowUp: 0,
                ArrowRight: 1,
                ArrowDown: 2,
                ArrowLeft: 3,
                w: 0,
                d: 1,
                s: 2,
                a: 3,
                W: 0,
                D: 1,
                S: 2,
                A: 3,
            };
            const direction = directions[event.key];
            if (direction !== undefined) {
                event.preventDefault();
                onMove(direction);
            }
        });

        canvas.addEventListener(
            'touchstart',
            (event) => {
                const touch = event.touches[0];
                this.touchX = touch.clientX;
                this.touchY = touch.clientY;
            },
            { passive: true },
        );
        canvas.addEventListener('touchend', (event) => {
            if (this.touchX == null || this.touchY == null) {
                return;
            }
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - this.touchX;
            const deltaY = touch.clientY - this.touchY;
            if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
                return;
            }
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                onMove(deltaX > 0 ? 1 : 3);
            } else {
                onMove(deltaY > 0 ? 2 : 0);
            }
            this.touchX = this.touchY = null;
        });
        canvas.addEventListener(
            'touchmove',
            (event) => event.preventDefault(),
            {
                passive: false,
            },
        );
    }
}
