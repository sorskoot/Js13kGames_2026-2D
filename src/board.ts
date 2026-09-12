import {GRID_SIZE, UNICORN_TIER} from './game-data.js';
import type {CellCoordinates, Direction, MoveAnimation} from './game-data.js';

/**
 * Manages the tile grid, score, win state, and movement rules for the game board.
 */
export class Board {
    private cells: number[][] = [];
    private currentScore = 0;
    private hasWon = false;

    /** Gets the current tile grid as a read-only view. */
    get grid(): readonly (readonly number[])[] {
        return this.cells;
    }

    /** Gets the score accumulated from tile merges. */
    get score(): number {
        return this.currentScore;
    }

    /** Gets whether a tile has reached the unicorn tier. */
    get won(): boolean {
        return this.hasWon;
    }

    /** Resets the grid, score, and win state to their initial values. */
    reset(): void {
        this.cells = Array.from({length: GRID_SIZE}, () => Array<number>(GRID_SIZE).fill(0));
        this.currentScore = 0;
        this.hasWon = false;
    }

    /**
     * Adds a randomly valued tile to a randomly selected empty cell.
     *
     * @returns The coordinates of the added tile, or `undefined` when the grid is full
     */
    addTile(): CellCoordinates | undefined {
        const empty = this.emptyCells();
        if (!empty.length) {
            return;
        }
        const [row, column] = empty[(Math.random() * empty.length) | 0];
        this.cells[row][column] = Math.random() < 0.85 ? 1 : 2;
        return [row, column];
    }

    /**
     * Slides and merges tiles in the requested direction.
     *
     * @param direction - The direction in which to move the tiles
     * @returns Movement and merge animation data when the board changes, or `undefined` otherwise
     */
    move(direction: Direction) {
        let moved = false;
        const merges: CellCoordinates[] = [];
        const movements: Omit<MoveAnimation, 'type'>[] = [];

        for (let lineIndex = 0; lineIndex < GRID_SIZE; lineIndex++) {
            const line = this.lineOf(lineIndex, direction);
            const values = line
                .map(([row, column]) => ({
                    value: this.cells[row][column],
                    row,
                    column
                }))
                .filter(tile => tile.value);
            const result = [];
            for (let index = 0; index < values.length; index++) {
                if (
                    index + 1 < values.length &&
                    values[index].value === values[index + 1].value &&
                    values[index].value < UNICORN_TIER
                ) {
                    const value = values[index].value + 1;
                    result.push({
                        value,
                        from: [values[index], values[index + 1]],
                        merged: true
                    });
                    this.currentScore += value * value * 2;
                    if (value === UNICORN_TIER) {
                        this.hasWon = true;
                    }
                    index++;
                } else {
                    result.push({
                        value: values[index].value,
                        from: [values[index]],
                        merged: false
                    });
                }
            }

            const newLine = Array<number>(GRID_SIZE).fill(0);
            for (let index = 0; index < result.length; index++) {
                newLine[index] = result[index].value;
                const [targetRow, targetColumn] = line[index];
                result[index].from.forEach(source => {
                    if (source.row !== targetRow || source.column !== targetColumn) {
                        moved = true;
                    }
                    movements.push({
                        value: source.value,
                        fr: source.row,
                        fc: source.column,
                        tr: targetRow,
                        tc: targetColumn,
                        t: 0
                    });
                });
                if (result[index].merged) {
                    merges.push([targetRow, targetColumn]);
                }
            }
            for (let index = 0; index < GRID_SIZE; index++) {
                const [row, column] = line[index];
                if (this.cells[row][column] !== newLine[index]) {
                    moved = true;
                }
                this.cells[row][column] = newLine[index];
            }
        }

        if (moved) {
            return {movements, merges};
        }
    }

    /**
     * Determines whether the board has at least one legal move remaining.
     *
     * @returns `true` when an empty cell or mergeable pair remains; otherwise `false`
     */
    hasMoves(): boolean {
        if (this.emptyCells().length) {
            return true;
        }
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                if (this.cells[row][column] === UNICORN_TIER) {
                    continue;
                }
                if (column + 1 < GRID_SIZE && this.cells[row][column] === this.cells[row][column + 1]) {
                    return true;
                }
                if (row + 1 < GRID_SIZE && this.cells[row][column] === this.cells[row + 1][column]) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Gets the coordinates of all currently empty cells. */
    private emptyCells(): CellCoordinates[] {
        const empty: CellCoordinates[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                if (!this.cells[row][column]) {
                    empty.push([row, column]);
                }
            }
        }
        return empty;
    }

    /** Gets the cell coordinates for a board line in movement traversal order. */
    private lineOf(index: number, direction: Direction): CellCoordinates[] {
        const line: CellCoordinates[] = [];
        for (let offset = 0; offset < GRID_SIZE; offset++) {
            if (direction === 0) {
                line.push([offset, index]);
            } else if (direction === 2) {
                line.push([GRID_SIZE - 1 - offset, index]);
            } else if (direction === 3) {
                line.push([index, offset]);
            } else {
                line.push([index, GRID_SIZE - 1 - offset]);
            }
        }
        return line;
    }
}
