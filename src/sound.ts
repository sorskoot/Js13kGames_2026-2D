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
    jsfxr([1,,0.132,,0.593,0.440,,0.303,,,,,,1,,0.446,,,1,,,,,0.25]),
    // prettier-ignore
    jsfxr([0,,0.3011,,0.1964,0.2467,,0.366,,,,,,0.4903,,0.5117,,,1,,,,,0.25]),
    // prettier-ignore
    jsfxr([3,0.1,0.12,0.0441,0.214,1,0.496,-0.133,-0.044,-0.109,-0.067,0.016,-0.031,0.1795,-0.0373,-0.0686,0.113,0.0125,0.3,0.0289,-0.0252,-0.0946,-0.0289,0.25]),
    // prettier-ignore
    jsfxr([1,0.142,0.7032,0.6371,0.3912,0.436,0.064,0.127,0.01,0.466,0.24,,0.5662,0.9011,,,,,0.457,0.0981,0.6629,,,0.25,44100,8]),
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
      merge: 0,
      combo: 1,
      move: 2,
      : 3,
      : 4,
      : 5,
      : 6
      : 7
      */
};
/** Initialize audio context on first user interaction */
['pointerdown', 'keydown'].map(x => addEventListener(x, InitAudio, {once: true}));
