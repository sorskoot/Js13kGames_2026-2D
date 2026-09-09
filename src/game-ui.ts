import { COLORS, NAMES } from './game-data.js';

export class GameUI {
    private readonly scoreElement = document.getElementById('score')!;
    private readonly bestElement = document.getElementById('best')!;
    private readonly overlay = document.getElementById('overlay')!;
    private readonly message = document.getElementById('ov-msg')!;
    private readonly subtitle = document.getElementById('ov-sub')!;
    private readonly keepButton = document.getElementById('ov-keep')!;
    private best = +(localStorage.getItem('rm_best') || 0);

    constructor(onNewGame: () => void) {
        this.bestElement.textContent = String(this.best);
        document.getElementById('new')!.onclick = onNewGame;
        document.getElementById('ov-new')!.onclick = onNewGame;
        this.keepButton.onclick = () => {
            this.overlay.classList.remove('shown');
            this.hideOverlay();
        };
    }

    get overlayShown(): boolean {
        return this.overlay.classList.contains('shown');
    }

    updateScore(score: number): void {
        this.scoreElement.textContent = String(score);
        if (score > this.best) {
            this.best = score;
            localStorage.setItem('rm_best', String(this.best));
            this.bestElement.textContent = String(this.best);
        }
    }

    showWin(score: number): void {
        this.overlay.classList.add('shown');
        this.overlay.classList.remove('hidden');
        this.message.textContent = '\u{1f984} You made a Unicorn!';
        this.subtitle.textContent = 'Pure rainbow magic. Score: ' + score;
        this.keepButton.classList.remove('hidden');
    }

    showDead(score: number): void {
        this.overlay.classList.add('shown');
        this.overlay.classList.remove('hidden');
        this.message.textContent = 'Game Over';
        this.subtitle.textContent = 'The rainbow ran dry. Score: ' + score;
        this.keepButton.classList.add('hidden');
    }

    hideOverlay(): void {
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('shown');
    }

    buildLegend(): void {
        const legend = document.getElementById('legend')!;
        legend.innerHTML = '';
        for (let index = 0; index < 10; index++) {
            const tile = document.createElement('div');
            tile.className = 'lg';
            if (index === 9) {
                tile.textContent = '\u{1f984}';
                tile.style.background =
                    'conic-gradient(red,orange,yellow,green,blue,violet,red)';
            } else {
                tile.style.background = COLORS[index];
            }
            tile.title = NAMES[index];
            legend.appendChild(tile);
        }
    }
}
