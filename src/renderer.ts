import { COLORS, GRID_SIZE } from './game-data.js';
import type {
    CellCoordinates,
    MoveAnimation,
    Particle,
    TileAnimation,
} from './game-data.js';

type Grid = readonly (readonly number[])[];

export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private animations: (TileAnimation | MoveAnimation)[] = [];
    private particles: Particle[] = [];
    private cell = 0;
    private pad = 0;
    private size = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
    }

    layout(): void {
        const width = Math.min(window.innerWidth - 24, 460);
        this.size = Math.max(240, width);
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.pad = this.size * 0.03;
        this.cell = (this.size - this.pad * (GRID_SIZE + 1)) / GRID_SIZE;
    }

    reset(): void {
        this.animations = [];
        this.particles = [];
    }

    spawnTile([row, column]: CellCoordinates): void {
        this.animations.push({ r: row, c: column, type: 'spawn', t: 0 });
    }

    animateMove(
        movements: Omit<MoveAnimation, 'type'>[],
        merges: CellCoordinates[],
        grid: Grid,
    ): void {
        this.animations = movements.map((movement) => ({
            ...movement,
            type: 'move',
        }));
        merges.forEach(([row, column]) => {
            this.animations.push({ r: row, c: column, type: 'pop', t: 0 });
            this.spawnParticles(row, column, grid[row][column]);
        });
    }

    celebrate(grid: Grid): void {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                if (grid[row][column]) {
                    this.spawnParticles(row, column, 10);
                }
            }
        }
    }

    draw(grid: Grid): void {
        const context = this.context;
        const size = this.size;
        const cell = this.cell;
        context.clearRect(0, 0, size, size);
        context.fillStyle = 'rgba(255,255,255,.5)';
        this.roundRect(0, 0, size, size, size * 0.04);
        context.fill();
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                const position = this.cellPos(row, column);
                context.fillStyle = 'rgba(120,110,150,.12)';
                this.roundRect(position.x, position.y, cell, cell, cell * 0.16);
                context.fill();
            }
        }

        const moving = this.animations.filter(
            (animation) => animation.type === 'move',
        );
        const popped: Partial<Record<string, TileAnimation>> = {};
        this.animations
            .filter(
                (animation): animation is TileAnimation =>
                    animation.type === 'pop',
            )
            .forEach(
                (animation) =>
                    (popped[animation.r + ',' + animation.c] = animation),
            );
        const spawned: Partial<Record<string, TileAnimation>> = {};
        this.animations
            .filter(
                (animation): animation is TileAnimation =>
                    animation.type === 'spawn',
            )
            .forEach(
                (animation) =>
                    (spawned[animation.r + ',' + animation.c] = animation),
            );

        if (moving.length) {
            const duration = 90;
            let done = true;
            moving.forEach((animation) => {
                animation.t += 16;
                const progress = Math.min(1, animation.t / duration);
                if (progress < 1) {
                    done = false;
                }
                const from = this.cellPos(animation.fr, animation.fc);
                const to = this.cellPos(animation.tr, animation.tc);
                const left = from.x + (to.x - from.x) * this.ease(progress);
                const top = from.y + (to.y - from.y) * this.ease(progress);
                this.drawTile(
                    left,
                    top,
                    cell,
                    grid[animation.tr][animation.tc],
                    1,
                );
            });
            if (done) {
                this.animations = this.animations.filter(
                    (animation) => animation.type !== 'move',
                );
            }
        } else {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let column = 0; column < GRID_SIZE; column++) {
                    const value = grid[row][column];
                    if (!value) {
                        continue;
                    }
                    const position = this.cellPos(row, column);
                    let scale = 1;
                    const spawn = spawned[row + ',' + column];
                    if (spawn) {
                        spawn.t += 16;
                        scale = Math.min(1, spawn.t / 160);
                        if (spawn.t >= 160) {
                            this.animations = this.animations.filter(
                                (animation) => animation !== spawn,
                            );
                        }
                    }
                    const pop = popped[row + ',' + column];
                    if (pop) {
                        pop.t += 16;
                        const progress = Math.min(1, pop.t / 160);
                        scale = 1 + Math.sin(progress * Math.PI) * 0.22;
                        if (pop.t >= 160) {
                            this.animations = this.animations.filter(
                                (animation) => animation !== pop,
                            );
                        }
                    }
                    this.drawTile(position.x, position.y, cell, value, scale);
                }
            }
        }

        this.drawParticles();
    }

    private cellPos(row: number, column: number) {
        return {
            x: this.pad + column * (this.cell + this.pad),
            y: this.pad + row * (this.cell + this.pad),
        };
    }

    private spawnParticles(row: number, column: number, tier: number): void {
        const position = this.cellPos(row, column);
        const centerX = position.x + this.cell / 2;
        const centerY = position.y + this.cell / 2;
        const color = tier >= 10 ? '#fff' : COLORS[tier - 1];
        const count = tier >= 10 ? 40 : 12;
        for (let index = 0; index < count; index++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * (tier >= 10 ? 6 : 3);
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                col: tier >= 10 ? `hsl(${(index * 30) % 360},90%,60%)` : color,
            });
        }
    }

    private drawParticles(): void {
        const context = this.context;
        for (let index = this.particles.length - 1; index >= 0; index--) {
            const particle = this.particles[index];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.12;
            particle.life -= 0.03;
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
                continue;
            }
            context.globalAlpha = particle.life;
            context.fillStyle = particle.col;
            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                this.size * 0.012,
                0,
                Math.PI * 2,
            );
            context.fill();
            context.globalAlpha = 1;
        }
    }

    private roundRect(
        left: number,
        top: number,
        width: number,
        height: number,
        radius: number,
    ): void {
        const context = this.context;
        context.beginPath();
        context.moveTo(left + radius, top);
        context.arcTo(left + width, top, left + width, top + height, radius);
        context.arcTo(left + width, top + height, left, top + height, radius);
        context.arcTo(left, top + height, left, top, radius);
        context.arcTo(left, top, left + width, top, radius);
        context.closePath();
    }

    private drawTile(
        left: number,
        top: number,
        size: number,
        tier: number,
        scale: number,
    ): void {
        const context = this.context;
        context.save();
        context.translate(left + size / 2, top + size / 2);
        context.scale(scale, scale);
        context.translate(-size / 2, -size / 2);
        const radius = size * 0.16;
        context.shadowColor = 'rgba(0,0,0,.25)';
        context.shadowBlur = size * 0.08;
        context.shadowOffsetY = size * 0.04;

        if (tier >= 10) {
            const gradient = context.createLinearGradient(0, 0, size, size);
            const offset = (performance.now() / 20) % 360;
            for (let index = 0; index <= 6; index++) {
                gradient.addColorStop(
                    index / 6,
                    `hsl(${(offset + index * 60) % 360},85%,62%)`,
                );
            }
            context.fillStyle = gradient;
            this.roundRect(0, 0, size, size, radius);
            context.fill();
            context.shadowBlur = 0;
            context.shadowOffsetY = 0;
            context.font = `${size * 0.5}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('\u{1f984}', size / 2, size / 2 + size * 0.02);
        } else {
            context.fillStyle = COLORS[tier - 1];
            this.roundRect(0, 0, size, size, radius);
            context.fill();
            context.shadowBlur = 0;
            context.shadowOffsetY = 0;
            const gloss = context.createLinearGradient(0, 0, 0, size);
            gloss.addColorStop(0, 'rgba(255,255,255,.35)');
            gloss.addColorStop(0.5, 'rgba(255,255,255,0)');
            context.fillStyle = gloss;
            this.roundRect(0, 0, size, size, radius);
            context.fill();
            context.fillStyle = 'rgba(255,255,255,.85)';
            context.font = `700 ${size * 0.26}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(String(tier), size / 2, size / 2);
        }
        context.restore();
    }

    private ease(progress: number): number {
        return 1 - Math.pow(1 - progress, 3);
    }
}
