/** Number of rows and columns in the square game grid. */
export const GRID_SIZE = 4;

/** Tile colors ordered from the lowest tier through the unicorn tier. */
export const COLORS = [
    '#f16b87',
    '#ffa25e',
    '#f6d15a',
    '#70ce9c',
    '#60d2df',
    '#719ded',
    '#b28ae0',
    '#f3a5d2',
    '#fff2fc'
];

/** Display names for tile tiers, ordered from lowest to highest. */
export const NAMES = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Rainbow', 'Unicorn'];

/** Numeric value of the final, winning unicorn tile tier. */
export const UNICORN_TIER = NAMES.length;

/** Duration of tile movement animations in milliseconds. */
export const MOVE_DURATION = 140;

/** Encoded direction used when traversing and moving tiles on the board. */
export type Direction = 0 | 1 | 2 | 3;

/** Coordinates identifying a cell by its row and column indexes. */
export type CellCoordinates = [row: number, column: number];

/** State for a tile spawn or merge-pop animation. */
export type TileAnimation = {
    type: 'spawn' | 'pop';
    r: number;
    c: number;
    t: number;
    emitted?: boolean;
};

/** State describing a tile's movement between two board cells. */
export type MoveAnimation = {
    type: 'move';
    value: number;
    fr: number;
    fc: number;
    tr: number;
    tc: number;
    t: number;
};

/** State for a single visual-effect particle. */
export type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    col: string;
    size: number;
    decay: number;
    rotation: number;
    shape: number;
};
