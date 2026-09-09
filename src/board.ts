import { GRID_SIZE } from './game-data.js';
import type { CellCoordinates, Direction, MoveAnimation } from './game-data.js';

export class Board {
    private cells: number[][] = [];
    private currentScore = 0;
    private hasWon = false;

    get grid(): readonly (readonly number[])[] {
        return this.cells;
    }

    get score(): number {
        return this.currentScore;
    }

    get won(): boolean {
        return this.hasWon;
    }

    reset(): void {
        this.cells = Array.from({ length: GRID_SIZE }, () =>
            Array<number>(GRID_SIZE).fill(0),
        );
        this.currentScore = 0;
        this.hasWon = false;
    }

    addTile(): CellCoordinates | undefined {
        const empty = this.emptyCells();
        if (!empty.length) {
            return;
        }
        const [row, column] = empty[(Math.random() * empty.length) | 0];
        this.cells[row][column] = Math.random() < 0.85 ? 1 : 2;
        return [row, column];
    }

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
                    column,
                }))
                .filter((tile) => tile.value);
            const result = [];
            for (let index = 0; index < values.length; index++) {
                if (
                    index + 1 < values.length &&
                    values[index].value === values[index + 1].value &&
                    values[index].value < 10
                ) {
                    const value = values[index].value + 1;
                    result.push({
                        value,
                        from: [values[index], values[index + 1]],
                        merged: true,
                    });
                    this.currentScore += value * value * 2;
                    if (value === 10) {
                        this.hasWon = true;
                    }
                    index++;
                } else {
                    result.push({
                        value: values[index].value,
                        from: [values[index]],
                        merged: false,
                    });
                }
            }

            const newLine = Array<number>(GRID_SIZE).fill(0);
            for (let index = 0; index < result.length; index++) {
                newLine[index] = result[index].value;
                const [targetRow, targetColumn] = line[index];
                result[index].from.forEach((source) => {
                    if (
                        source.row !== targetRow ||
                        source.column !== targetColumn
                    ) {
                        moved = true;
                    }
                    movements.push({
                        fr: source.row,
                        fc: source.column,
                        tr: targetRow,
                        tc: targetColumn,
                        t: 0,
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
            return { movements, merges };
        }
    }

    hasMoves(): boolean {
        if (this.emptyCells().length) {
            return true;
        }
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                if (
                    column + 1 < GRID_SIZE &&
                    this.cells[row][column] === this.cells[row][column + 1]
                ) {
                    return true;
                }
                if (
                    row + 1 < GRID_SIZE &&
                    this.cells[row][column] === this.cells[row + 1][column]
                ) {
                    return true;
                }
            }
        }
        return false;
    }

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
