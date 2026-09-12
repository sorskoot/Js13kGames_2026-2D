import {jsfxr} from './lib/jsfxr.js';

let audiopool: HTMLAudioElement[] = [];
let pannerNodes: PannerNode[] = [];


let audioContext: AudioContext | null = null;

/** Initializes the shared audio context and reusable pool of audio elements. */
export function InitAudio() {
    if (audioContext) {
        return;
    }
    audioContext = new AudioContext();
    audioContext.listener.upY.value = 1;
    let gain = audioContext.createGain();
    gain.connect(audioContext.destination);

    for (let i = 0; i < 25; i++) {
        const audio = new Audio();
        audiopool.push(audio);
        const element = audioContext.createMediaElementSource(audio);
        element.connect(gain);
    }
}
let currentSfxIndex = 0;
let soundfx = [
    // prettier-ignore
    jsfxr([1,,0.1272,,0.3603,0.6492,0.2,-0.2783,,,,,,0.7756,-0.6954,,,,1,,,0.2280,,1,
    ]),
    // prettier-ignore
    jsfxr([3, , 0.242, 0.5252, 0.272, 0.0531, , -0.0104, , , , 0.444, 0.7092, , , , 0.09972, -0.2081, 1, , , , , 1]),
    // prettier-ignore
    jsfxr([ 3,
 0.1,
 0.12,
 0.04417707109428905,
 0.214,
 1,
 0.496,
 -0.133,
 -0.04440589696357673,
 -0.1098871706800052,
 -0.06794177836213328,
 0.016770033208625815,
 -0.031498327851195815,
 0.1795553212360554,
 -0.037345044507605084,
 -0.06863090695856885,
 0.1130775641364003,
 0.012508172097187218,
 0.3,
 0.028971241275851566,
 -0.025225312307559096,
 -0.09464238289961284,
 -0.028983351245382385,
 0.25,
 44100,
 8]),
    // prettier-ignore
    jsfxr([3, , 0.2043, 0.5884, 0.2696, 0.1493, , -0.35, , , , , , , , , , , 1, , , , , 0.5]),
    ,
    ,
    // prettier-ignore
    jsfxr([0, , 0.0343, , 0.2762, 0.533, , -0.4588, , , , , , 0.2202, , , , , 1, , , , , 1]),
    // prettier-ignore
    jsfxr([0, , 0.1957, , 0.1236, 0.5185, , 0.1997, , , , , , 0.2281, , , , , 0.8683, , , , , .5])
];

/** Sound-effect playback controller backed by a reusable audio-element pool. */
export const sound = {
    /**
     * Plays a generated sound effect when audio has been initialized.
     *
     * @param sfx - Index of the sound effect to play
     */
    play: function (sfx: number) {
        if (!audioContext) return;
        audiopool[currentSfxIndex].src = soundfx[sfx]!;
        audiopool[currentSfxIndex].play();
        currentSfxIndex = (currentSfxIndex + 1) % 25;
    }
    /*
      shoot: 0,
      kill: 1,
      gameover: 2,
      block: 3,
      //spawn: 4,
      //upgrade: 5,
      bite: 6
      squick: 7
      */
};
/** Initialize audio context on first user interaction */
['pointerdown', 'keydown'].map(x => addEventListener(x, InitAudio, {once: true}));
