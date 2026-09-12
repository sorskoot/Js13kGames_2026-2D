import {NAMES, UNICORN_TIER} from './game-data.js';
import {paintGem, paintRainbow, paintStar, paintUnicorn} from './magic-art.js';
import {sound} from './sound.js';

/**
 * Manages score, progress, overlays, combo feedback, and decorative game UI.
 */
export class GameUI {
    private readonly scoreElement = document.getElementById('score')!;
    private readonly bestElement = document.getElementById('best')!;
    private readonly overlay = document.getElementById('overlay')!;
    private readonly message = document.getElementById('ov-msg')!;
    private readonly subtitle = document.getElementById('ov-sub')!;
    private readonly keepButton = document.getElementById('ov-keep')!;
    private readonly comboElement = document.getElementById('combo')!;
    private comboTimer = 0;
    private streak = 0;
    private currentTier = 0;
    private best = +(localStorage.getItem('rm_best') || 0);

    /**
     * Creates the game UI and wires its controls and responsive artwork.
     *
     * @param onNewGame - Callback invoked when a new game is requested
     */
    constructor(onNewGame: () => void) {
        this.bestElement.textContent = String(this.best);
        document.getElementById('new')!.onclick = onNewGame;
        document.getElementById('ov-new')!.onclick = onNewGame;
        this.keepButton.onclick = () => {
            this.hideOverlay();
        };
        this.paintMascot('goal-art');
        this.paintMascot('win-art');
        this.paintSky();
        addEventListener('resize', () => this.paintSky());
        this.overlay.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !this.keepButton.classList.contains('hidden')) {
                this.hideOverlay();
            }
            if (event.key === 'Tab') {
                const buttons = [...this.overlay.querySelectorAll<HTMLButtonElement>('button:not(.hidden)')];
                const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
                event.preventDefault();
            }
        });
    }

    /** Gets whether the end-game overlay is currently visible. */
    get overlayShown(): boolean {
        return this.overlay.classList.contains('shown');
    }

    /**
     * Updates the displayed score and persists a new best score when reached.
     *
     * @param score - Current game score
     */
    updateScore(score: number): void {
        this.scoreElement.textContent = String(score);
        if (score > this.best) {
            this.best = score;
            localStorage.setItem('rm_best', String(this.best));
            this.bestElement.textContent = String(this.best);
        }
    }

    /**
     * Displays the winning overlay for reaching the unicorn tier.
     *
     * @param score - Final or current score to display
     * @param canContinue - Whether to offer the option to continue playing
     */
    showWin(score: number, canContinue = true): void {
        this.overlay.classList.add('won');
        this.message.textContent = 'Hello, little unicorn!';
        this.subtitle.textContent = 'You made the whole rainbow shine. ' + score + ' points of pure magic.';
        this.keepButton.classList.toggle('hidden', !canContinue);
        this.showOverlay();
    }

    /**
     * Displays the game-over overlay when no legal moves remain.
     *
     * @param score - Final score to display
     */
    showDead(score: number): void {
        sound.play(3);
        this.overlay.classList.remove('won');
        this.message.textContent = 'Game Over';
        this.subtitle.textContent = 'No more matches. Your rainbow brought ' + score + ' points of magic.';
        this.keepButton.classList.add('hidden');
        this.showOverlay();
    }

    /** Hides the overlay and returns keyboard focus to the game canvas. */
    hideOverlay(): void {
        const wasShown = this.overlayShown;
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('shown');
        this.overlay.inert = true;
        document.getElementById('wrap')!.inert = false;
        if (wasShown) {
            document.getElementById('canvas')!.focus({preventScroll: true});
        }
    }

    /** Resets transient combo, journey, and overlay UI state for a new game. */
    reset(): void {
        this.streak = 0;
        this.currentTier = 0;
        clearTimeout(this.comboTimer);
        this.comboElement.className = '';
        this.comboElement.textContent = '';
        this.hideOverlay();
    }

    /**
     * Updates accessible board text and the visual tier-progress journey.
     *
     * @param grid - Current grid of numeric tile tiers
     */
    updateJourney(grid: readonly (readonly number[])[]): void {
        document
            .getElementById('canvas')!
            .setAttribute(
                'aria-label',
                '4 by 4 rainbow puzzle. ' +
                    grid.map(row => row.map(value => NAMES[value - 1] || 'empty').join(', ')).join('; ') +
                    '. Use arrow keys or swipe to merge.'
            );
        const tier = Math.max(...grid.flat());
        if (tier === this.currentTier) {
            return;
        }
        this.currentTier = tier;
        document.getElementById('current-color')!.innerHTML =
            NAMES[tier - 1] + '<small>' + tier + ' / ' + NAMES.length + '</small>';
        document.querySelectorAll<HTMLElement>('.lg').forEach((tile, index) => {
            tile.classList.toggle('reached', index < tier);
            tile.classList.toggle('current', index === tier - 1);
            if (index === tier - 1) {
                tile.setAttribute('aria-current', 'step');
            } else {
                tile.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Shows combo feedback when a move produces enough merges or extends a streak.
     *
     * @param merges - Number of merges produced by the latest move
     * @param tier - Highest tile tier involved in the latest move
     */
    showCombo(merges: number, tier: number): void {
        this.streak = merges ? this.streak + 1 : 0;
        const combo = Math.max(merges, this.streak);
        if (combo < 2) {
            return;
        }
        sound.play(1);
        clearTimeout(this.comboTimer);
        this.comboElement.className = '';
        void this.comboElement.offsetWidth;
        const rainbow = tier >= UNICORN_TIER - 1 || combo >= 5;
        this.comboElement.textContent = rainbow ? 'RAINBOW COMBO!' : 'COMBO x' + combo;
        this.comboElement.className = 'active' + (rainbow ? ' rainbow' : '');
        this.comboTimer = window.setTimeout(() => {
            this.comboElement.className = '';
            this.comboElement.textContent = '';
        }, 1250);
    }

    /** Shows the overlay, disables the game area, and focuses its first visible button. */
    private showOverlay(): void {
        this.overlay.classList.add('shown');
        this.overlay.classList.remove('hidden');
        this.overlay.inert = false;
        document.getElementById('wrap')!.inert = true;
        this.overlay.querySelector<HTMLButtonElement>('button:not(.hidden)')!.focus();
    }

    /** Builds the tile-tier legend and paints an icon for each tier. */
    buildLegend(): void {
        const legend = document.getElementById('legend')!;
        legend.innerHTML = '';
        for (let index = 0; index < NAMES.length; index++) {
            const tile = document.createElement('li');
            tile.className = 'lg';
            const icon = document.createElement('canvas');
            icon.width = icon.height = 100;
            icon.setAttribute('aria-hidden', 'true');
            const context = icon.getContext('2d')!;
            context.translate(6, 6);
            paintGem(context, 88, index + 1);
            const name = document.createElement('span');
            name.textContent = NAMES[index];
            tile.append(icon, name);
            tile.title = NAMES[index];
            legend.appendChild(tile);
        }
    }

    /** Paints the decorative rainbow-unicorn mascot into the specified canvas. */
    private paintMascot(id: string): void {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const context = canvas.getContext('2d')!;
        context.scale(canvas.width / 120, canvas.height / 110);
        context.save();
        context.translate(10, -2);
        context.globalAlpha = 0.55;
        paintRainbow(context);
        context.restore();
        context.save();
        context.translate(22, 25);
        context.scale(0.78, 0.78);
        paintUnicorn(context);
        context.restore();
        for (const [left, top, size] of [
            [15, 32, 4],
            [100, 51, 5],
            [18, 85, 3],
            [93, 93, 3]
        ]) {
            context.save();
            context.translate(left, top);
            context.fillStyle = '#d5b36f';
            paintStar(context, size);
            context.restore();
        }
    }

    /** Repaints the responsive background sky artwork for the current viewport. */
    private paintSky(): void {
        const canvas = document.getElementById('sky') as HTMLCanvasElement;
        const ratio = Math.min(devicePixelRatio || 1, 2);
        const width = innerWidth;
        const height = innerHeight;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const context = canvas.getContext('2d')!;
        context.scale(ratio, ratio);
        context.save();
        context.globalAlpha = 0.13;
        context.translate(width * 0.82 - 140, height * 0.18 - 110);
        context.scale(3.7, 3.7);
        paintRainbow(context);
        context.restore();
        context.save();
        context.globalAlpha = 0.08;
        context.translate(-140, height * 0.68);
        context.rotate(-0.15);
        context.scale(4.5, 4.5);
        paintRainbow(context);
        context.restore();
        for (const [left, top, scale] of [
            [width * 0.12, height * 0.32, 1.1],
            [width * 0.86, height * 0.54, 0.9],
            [width * 0.2, height * 0.88, 0.75],
            [width * 0.92, height * 0.16, 0.6]
        ]) {
            context.save();
            context.translate(left, top);
            context.scale(scale, scale);
            context.fillStyle = '#ffffff65';
            context.beginPath();
            context.ellipse(0, 0, 85, 22, 0, 0, Math.PI * 2);
            context.ellipse(-30, -16, 30, 25, 0, 0, Math.PI * 2);
            context.ellipse(10, -25, 37, 33, 0, 0, Math.PI * 2);
            context.ellipse(49, -10, 26, 22, 0, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
        for (let index = 0; index < 24; index++) {
            context.save();
            context.translate((index * 173 + 47) % width, (index * 131 + 75) % height);
            context.fillStyle = index % 3 ? '#ffffff99' : '#c3aad05a';
            paintStar(context, (index % 3) + 2);
            context.restore();
        }
    }
}
