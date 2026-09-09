import {COLORS, UNICORN_TIER} from './game-data.js';

export function paintStar(context: CanvasRenderingContext2D, radius: number, points = 4): void {
    context.beginPath();
    for (let index = 0; index < points * 2; index++) {
        const angle = (index * Math.PI) / points - Math.PI / 2;
        const length = index % 2 ? radius * 0.4 : radius;
        context.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    }
    context.closePath();
    context.fill();
}

export function paintRainbow(context: CanvasRenderingContext2D): void {
    context.save();
    context.lineWidth = 7;
    COLORS.slice(0, 7).forEach((color, index) => {
        context.strokeStyle = color;
        context.beginPath();
        context.arc(50, 72, 45 - index * 6, Math.PI, 0);
        context.stroke();
    });
    context.fillStyle = '#fff';
    for (const left of [9, 89]) {
        context.beginPath();
        context.ellipse(left, 75, 12, 8, 0, 0, Math.PI * 2);
        context.ellipse(left - 4, 70, 7, 8, 0, 0, Math.PI * 2);
        context.ellipse(left + 5, 69, 7, 9, 0, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();
}

export function paintUnicorn(context: CanvasRenderingContext2D): void {
    context.save();
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = 2;
    context.fillStyle = '#b79be9';
    context.fill(new Path2D('M34 31C4 38 7 71 17 83Q2 96 34 97L51 69Z'));
    context.lineWidth = 7;
    ['#92dbe2', '#f5c969', '#fa9cbf'].forEach((color, index) => {
        context.strokeStyle = color;
        context.stroke(
            new Path2D(
                `M${32 + index * 4} 36C${10 + index * 6} 53 ${17 + index * 5} 67 ${23 + index * 5} 76Q${8 + index * 6} 94 ${34 + index * 4} 90`
            )
        );
    });
    context.lineWidth = 2;
    context.fillStyle = '#fffafc';
    context.strokeStyle = '#d6bedf';
    const face = new Path2D(
        'M30 45Q19 18 30 22L43 35Q51 31 60 35L73 22Q84 19 76 47Q84 60 78 80Q73 95 52 94Q30 94 27 80Q22 61 30 45Z'
    );
    context.fill(face);
    context.stroke(face);
    context.fillStyle = '#f8b9cf';
    context.fill(new Path2D('M30 29L34 43L40 39ZM72 29L63 39L71 43Z'));
    context.fillStyle = '#ffe396';
    context.strokeStyle = '#e9bc66';
    const horn = new Path2D('M45 35L54 5Q55 2 56 6L63 36Z');
    context.fill(horn);
    context.stroke(horn);
    context.stroke(new Path2D('M49 24L61 28M51 16L58 19'));
    context.fillStyle = '#f3a2cc';
    context.fill(new Path2D('M32 48Q28 32 47 32Q70 30 69 49Q52 43 51 38Q46 54 32 55Z'));
    context.strokeStyle = '#c1a2e6';
    context.lineWidth = 5;
    context.stroke(new Path2D('M35 47Q47 46 48 36'));
    context.strokeStyle = '#7ed5db';
    context.lineWidth = 3;
    context.stroke(new Path2D('M32 41Q39 41 42 36'));
    context.fillStyle = '#ffe3eb';
    context.beginPath();
    context.ellipse(54, 81, 20, 11, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#f8b4ca';
    context.beginPath();
    context.ellipse(35, 70, 7, 4, 0, 0, Math.PI * 2);
    context.ellipse(73, 70, 6, 4, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#705577';
    context.lineWidth = 2.5;
    context.stroke(new Path2D('M33 59Q38 65 43 59M63 59Q68 65 73 59M34 62L31 64M72 62L75 64M50 85Q54 88 58 85'));
    context.fillStyle = '#c492b4';
    for (const left of [47, 62]) {
        context.beginPath();
        context.ellipse(left, 79, 1.5, 2, 0, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();
}

export function paintSymbol(context: CanvasRenderingContext2D, tier: number): void {
    if (tier === UNICORN_TIER) {
        paintUnicorn(context);
        return;
    }
    if (tier === UNICORN_TIER - 1) {
        paintRainbow(context);
        return;
    }
    context.save();
    context.translate(50, 50);
    context.fillStyle = 'rgba(255,255,255,.85)';
    if (tier === 1) {
        context.fill(new Path2D('M0 28C-9 20-31 6-30-9C-29-27-8-31 0-16C8-31 29-27 30-9C31 6 9 20 0 28Z'));
    } else if (tier === 2 || tier === 3) {
        paintStar(context, 33, tier === 2 ? 8 : 5);
    } else if (tier === 4 || tier === 7) {
        const petals = tier === 4 ? 4 : 6;
        for (let index = 0; index < petals; index++) {
            context.rotate((Math.PI * 2) / petals);
            context.beginPath();
            context.ellipse(0, -17, 14, 17, 0, 0, Math.PI * 2);
            context.fill();
        }
    } else if (tier === 5) {
        context.fill(new Path2D('M0-36L27 0L0 36L-27 0Z'));
    } else {
        context.fill(new Path2D('M15-29A33 33 0 1 0 29 17A31 31 0 0 1 15-29Z'));
    }
    context.restore();
}

export function paintGem(context: CanvasRenderingContext2D, size: number, tier: number, time = 0): void {
    context.save();
    context.scale(size / 100, size / 100);
    const unicorn = tier === UNICORN_TIER;
    context.shadowColor = unicorn ? '#eea7d7' : COLORS[tier - 1] + '88';
    context.shadowBlur = unicorn ? 13 + Math.sin(time / 350) * 4 : 7;
    context.shadowOffsetY = 5;
    const base = context.createLinearGradient(0, 0, 85, 100);
    if (tier >= UNICORN_TIER - 1) {
        const colors = unicorn ? ['#fffaff', '#fff5cf', '#f9d4e7', '#c9eaf5'] : COLORS.slice(0, 7);
        colors.forEach((color, index) => base.addColorStop(index / (colors.length - 1), color));
    } else {
        base.addColorStop(0, COLORS[tier - 1]);
        base.addColorStop(1, COLORS[tier - 1]);
    }
    context.fillStyle = base;
    context.beginPath();
    context.roundRect(3, 2, 94, 92, 21);
    context.fill();
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    const gloss = context.createLinearGradient(0, 3, 0, 95);
    gloss.addColorStop(0, '#ffffff80');
    gloss.addColorStop(0.42, '#ffffff00');
    gloss.addColorStop(0.83, '#ffffff00');
    gloss.addColorStop(1, '#70407135');
    context.fillStyle = gloss;
    context.fill();
    context.strokeStyle = '#ffffff90';
    context.lineWidth = 1.5;
    context.stroke();
    context.fillStyle = '#ffffff65';
    context.fill(new Path2D('M15 23Q15 10 29 10H73Q84 10 84 17Q60 13 41 21Q25 29 15 23Z'));
    context.strokeStyle = '#ffffff55';
    context.stroke(new Path2D('M21 84Q48 90 77 83'));
    context.save();
    context.translate(unicorn ? 9 : 20, unicorn ? 5 : 20);
    context.scale(unicorn ? 0.82 : 0.6, unicorn ? 0.82 : 0.6);
    paintSymbol(context, tier);
    context.restore();
    context.fillStyle = '#ffffffce';
    context.translate(82, 25);
    paintStar(context, unicorn ? 7 : 4);
    context.restore();
}
