import {COLORS, GRID_SIZE, MOVE_DURATION, UNICORN_TIER} from './game-data.js';
import type {CellCoordinates, MoveAnimation, Particle, TileAnimation} from './game-data.js';
import {paintGem, paintRainbow, paintStar, paintUnicorn} from './magic-art.js';

type Grid = readonly (readonly number[])[];

/**
 * Renders the game board, tile animations, particles, and win celebration.
 */
export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private animations: (TileAnimation | MoveAnimation)[] = [];
    private particles: Particle[] = [];
    private confetti: Particle[] = [];
    private readonly celebrationCanvas = document.getElementById('celebration') as HTMLCanvasElement;
    private readonly celebrationContext = this.celebrationCanvas.getContext('2d')!;
    private readonly motion = matchMedia('(prefers-reduced-motion: reduce)');
    private previousTime = performance.now();
    private celebrationStart = 0;
    private celebrationWave = 0;
    private cell = 0;
    private pad = 0;
    private size = 0;

    /**
     * Creates a renderer for the supplied game canvas.
     *
     * @param canvas - Canvas on which the board is rendered
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
    }

    /** Recalculates canvas resolution and board geometry for the current viewport. */
    layout(): void {
        const ratio = Math.min(devicePixelRatio || 1, 2);
        this.size = this.canvas.clientWidth;
        this.canvas.width = this.size * ratio;
        this.canvas.height = this.size * ratio;
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.pad = this.size * 0.03;
        this.cell = (this.size - this.pad * (GRID_SIZE + 1)) / GRID_SIZE;
        this.celebrationCanvas.width = innerWidth * ratio;
        this.celebrationCanvas.height = innerHeight * ratio;
        this.celebrationContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    /** Clears all active animations, particles, and celebration state. */
    reset(): void {
        this.animations = [];
        this.particles = [];
        this.confetti = [];
        this.celebrationStart = 0;
        this.celebrationContext.clearRect(0, 0, innerWidth, innerHeight);
    }

    /**
     * Starts a spawn animation for a newly added tile.
     *
     * @param coordinates - Row and column of the spawned tile
     */
    spawnTile([row, column]: CellCoordinates): void {
        this.animations.push({r: row, c: column, type: 'spawn', t: performance.now()});
    }

    /**
     * Starts tile movement and merge-pop animations for a completed board move.
     *
     * @param movements - Tile movements produced by the board
     * @param merges - Coordinates at which tile merges occurred
     * @param grid - Board state after the move
     */
    animateMove(movements: Omit<MoveAnimation, 'type'>[], merges: CellCoordinates[], grid: Grid): void {
        const now = performance.now();
        this.animations = movements.map(movement => ({
            ...movement,
            type: 'move',
            t: now
        }));
        merges.forEach(([row, column]) => {
            this.animations.push({r: row, c: column, type: 'pop', t: now + MOVE_DURATION});
        });
    }

    /**
     * Starts the unicorn win celebration unless reduced motion is requested.
     *
     * @param grid - Current board used to locate winning unicorn tiles
     */
    celebrate(grid: Grid): void {
        if (this.motion.matches) {
            return;
        }
        this.celebrationStart = performance.now();
        this.celebrationWave = 0;
        const bounds = this.canvas.getBoundingClientRect();
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                if (grid[row][column] === UNICORN_TIER) {
                    const position = this.cellPos(row, column);
                    this.burst(
                        bounds.left + position.x + this.cell / 2,
                        bounds.top + position.y + this.cell / 2,
                        UNICORN_TIER,
                        true
                    );
                }
            }
        }
    }

    /**
     * Renders one frame of the board and advances active visual effects.
     *
     * @param grid - Current board state to render
     */
    draw(grid: Grid): void {
        const context = this.context;
        const size = this.size;
        const cell = this.cell;
        const now = performance.now();
        const delta = Math.min(40, now - this.previousTime) / 1000;
        this.previousTime = now;
        context.clearRect(0, 0, size, size);
        context.fillStyle = '#d8cbe6';
        this.roundRect(0, 0, size, size, size * 0.04);
        context.fill();
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                const position = this.cellPos(row, column);
                const well = context.createLinearGradient(0, position.y, 0, position.y + cell);
                well.addColorStop(0, '#cabbdb');
                well.addColorStop(1, '#e9dfef');
                context.fillStyle = well;
                this.roundRect(position.x, position.y, cell, cell, cell * 0.16);
                context.fill();
                context.strokeStyle = '#ffffff60';
                context.lineWidth = 1;
                context.stroke();
                context.save();
                context.translate(position.x + cell / 2, position.y + cell / 2);
                context.fillStyle = '#ffffff35';
                paintStar(context, 3);
                context.restore();
            }
        }

        this.animations = this.animations.filter(
            animation => now - animation.t < (animation.type === 'move' ? MOVE_DURATION : 450)
        );
        const moving = this.motion.matches
            ? []
            : this.animations.filter((animation): animation is MoveAnimation => animation.type === 'move');
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let column = 0; column < GRID_SIZE; column++) {
                const tier = grid[row][column];
                if (!tier || moving.some(animation => animation.tr === row && animation.tc === column)) {
                    continue;
                }
                const position = this.cellPos(row, column);
                const animation = this.animations.find(
                    (entry): entry is TileAnimation => entry.type !== 'move' && entry.r === row && entry.c === column
                );
                let scaleX = 1;
                let scaleY = 1;
                if (animation && now >= animation.t && !this.motion.matches) {
                    const progress = Math.min(1, (now - animation.t) / 400);
                    if (animation.type === 'spawn') {
                        const eased = Math.min(1, progress * 2);
                        scaleX = scaleY = 1 + 2.7 * Math.pow(eased - 1, 3) + 1.7 * Math.pow(eased - 1, 2);
                    } else {
                        if (!animation.emitted) {
                            this.burst(position.x + cell / 2, position.y + cell / 2, tier);
                            animation.emitted = true;
                        }
                        const bounce = Math.sin(progress * Math.PI * 3) * (1 - progress);
                        scaleX = 1 + bounce * 0.18;
                        scaleY = 1 - bounce * 0.15;
                        context.save();
                        context.translate(position.x + cell / 2, position.y + cell / 2);
                        context.globalAlpha = (1 - progress) * 0.7;
                        context.shadowColor = COLORS[tier - 1];
                        context.shadowBlur = cell * 0.4;
                        context.strokeStyle = '#fff';
                        context.lineWidth = 2 + tier * 0.35;
                        context.beginPath();
                        context.arc(0, 0, cell * (0.35 + progress * 0.48), 0, Math.PI * 2);
                        context.stroke();
                        context.restore();
                    }
                }
                this.drawTile(position.x, position.y, cell, tier, scaleX, scaleY, now);
            }
        }
        for (const animation of moving) {
            const progress = Math.min(1, (now - animation.t) / MOVE_DURATION);
            const from = this.cellPos(animation.fr, animation.fc);
            const to = this.cellPos(animation.tr, animation.tc);
            const merging = this.animations.some(
                entry => entry.type === 'pop' && entry.r === animation.tr && entry.c === animation.tc
            );
            const squash = merging ? Math.pow(progress, 4) * 0.15 : 0;
            const horizontal = animation.fc !== animation.tc;
            this.drawTile(
                from.x + (to.x - from.x) * this.ease(progress),
                from.y + (to.y - from.y) * this.ease(progress),
                cell,
                animation.value,
                horizontal ? 1 - squash : 1 + squash,
                horizontal ? 1 + squash : 1 - squash,
                now
            );
        }
        this.drawParticles(context, this.particles, delta);
        this.drawCelebration(now, delta);
    }

    /** Gets the canvas position of a grid cell's top-left corner. */
    private cellPos(row: number, column: number) {
        return {
            x: this.pad + column * (this.cell + this.pad),
            y: this.pad + row * (this.cell + this.pad)
        };
    }

    /** Creates a particle burst at the specified canvas position. */
    private burst(centerX: number, centerY: number, tier: number, celebration = false): void {
        const particles = celebration ? this.confetti : this.particles;
        const count = celebration ? 100 : 8 + tier * 4;
        for (let index = 0; index < count; index++) {
            const angle = celebration ? -Math.PI / 2 + (Math.random() - 0.5) * 3 : Math.random() * Math.PI * 2;
            const speed = celebration
                ? 150 + Math.random() * 460
                : ((35 + Math.random() * (65 + tier * 15)) * this.size) / 426;
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                col: tier >= 7 ? COLORS[index % 7] : index % 3 ? COLORS[tier - 1] : '#fff',
                size: celebration ? 3 + Math.random() * 7 : 1.5 + Math.random() * (2 + tier * 0.4),
                decay: celebration ? 0.24 + Math.random() * 0.15 : 1 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI,
                shape: index % 3
            });
        }
    }

    /** Advances and paints a collection of particles for the current frame. */
    private drawParticles(context: CanvasRenderingContext2D, particles: Particle[], delta: number): void {
        for (let index = particles.length - 1; index >= 0; index--) {
            const particle = particles[index];
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.vy += 160 * delta;
            particle.rotation += delta * 2;
            particle.life -= particle.decay * delta;
            if (particle.life <= 0) {
                particles.splice(index, 1);
                continue;
            }
            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(particle.rotation);
            context.globalAlpha = Math.min(1, particle.life * 2);
            context.fillStyle = particle.col;
            if (particle.shape) {
                paintStar(context, particle.size * Math.min(1, particle.life * 3), particle.shape === 1 ? 4 : 5);
            } else {
                context.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2);
            }
            context.restore();
        }
    }

    /** Advances and paints the full-screen win celebration. */
    private drawCelebration(now: number, delta: number): void {
        const context = this.celebrationContext;
        if (!this.celebrationStart && !this.confetti.length) {
            return;
        }
        context.clearRect(0, 0, innerWidth, innerHeight);
        if (this.motion.matches) {
            this.confetti = [];
            this.celebrationStart = 0;
            return;
        }
        const elapsed = now - this.celebrationStart;
        if (this.celebrationStart && elapsed > this.celebrationWave * 450 && this.celebrationWave < 4) {
            this.burst(innerWidth * (this.celebrationWave % 2 ? 0.8 : 0.2), innerHeight * 0.8, UNICORN_TIER, true);
            this.celebrationWave++;
        }
        if (this.celebrationStart && elapsed < 1500) {
            const fade = Math.min(1, elapsed / 200, (1500 - elapsed) / 250);
            context.fillStyle = `rgba(255,245,253,${fade * 0.65})`;
            context.fillRect(0, 0, innerWidth, innerHeight);
            const size = Math.min(310, innerWidth * 0.75, innerHeight * 0.55);
            context.save();
            context.globalAlpha = fade;
            context.translate(innerWidth / 2, innerHeight / 2);
            context.rotate(Math.sin(elapsed / 170) * 0.06);
            const bounce = 0.85 + Math.min(1, elapsed / 300) * 0.15;
            context.scale((size / 100) * bounce, (size / 100) * bounce);
            context.translate(-50, -50);
            paintRainbow(context);
            context.translate(12, 8);
            context.scale(0.78, 0.78);
            paintUnicorn(context);
            context.restore();
        }
        this.drawParticles(context, this.confetti, delta);
        if (elapsed > 5000 && !this.confetti.length) {
            this.celebrationStart = 0;
        }
    }

    /** Creates a rounded-rectangle path on the board rendering context. */
    private roundRect(left: number, top: number, width: number, height: number, radius: number): void {
        const context = this.context;
        context.beginPath();
        context.moveTo(left + radius, top);
        context.arcTo(left + width, top, left + width, top + height, radius);
        context.arcTo(left + width, top + height, left, top + height, radius);
        context.arcTo(left, top + height, left, top, radius);
        context.arcTo(left, top, left + width, top, radius);
        context.closePath();
    }

    /** Paints a tile with the supplied position, tier, and animation scale. */
    private drawTile(
        left: number,
        top: number,
        size: number,
        tier: number,
        scaleX: number,
        scaleY: number,
        now: number
    ): void {
        const context = this.context;
        context.save();
        context.translate(left + size / 2, top + size / 2);
        context.scale(scaleX, scaleY);
        context.translate(-size / 2, -size / 2);
        paintGem(context, size, tier, this.motion.matches ? 0 : now);
        context.restore();
    }

    /** Applies cubic ease-out interpolation to normalized animation progress. */
    private ease(progress: number): number {
        return 1 - Math.pow(1 - progress, 3);
    }
}
