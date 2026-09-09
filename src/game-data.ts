export const GRID_SIZE = 4;

export const COLORS = [
    '#e53935',
    '#fb8c00',
    '#fdd835',
    '#c0ca33',
    '#43a047',
    '#00acc1',
    '#1e88e5',
    '#3949ab',
    '#8e24aa',
    '#ff69b4',
];

export const NAMES = [
    'Red',
    'Orange',
    'Yellow',
    'Lime',
    'Green',
    'Teal',
    'Blue',
    'Indigo',
    'Violet',
    'Unicorn',
];

export type Direction = 0 | 1 | 2 | 3;
export type CellCoordinates = [row: number, column: number];
export type TileAnimation = {
    type: 'spawn' | 'pop';
    r: number;
    c: number;
    t: number;
};
export type MoveAnimation = {
    type: 'move';
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
};
