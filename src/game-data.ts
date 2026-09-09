export const GRID_SIZE = 4;

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

export const NAMES = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Rainbow', 'Unicorn'];

export const UNICORN_TIER = NAMES.length;
export const MOVE_DURATION = 140;

export type Direction = 0 | 1 | 2 | 3;
export type CellCoordinates = [row: number, column: number];
export type TileAnimation = {
    type: 'spawn' | 'pop';
    r: number;
    c: number;
    t: number;
    emitted?: boolean;
};
export type MoveAnimation = {
    type: 'move';
    value: number;
    fr: number;
    fc: number;
    tr: number;
    tc: number;
    t: number;
};
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
