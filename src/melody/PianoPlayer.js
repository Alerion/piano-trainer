import { Piano } from 'tone-piano';
import Tone from 'tone';

const SALAMANDER_URL = 'https://storage.googleapis.com/download.magenta.tensorflow.org/demos/SalamanderPiano/';
const MAX_VELOCITY = 127;


export default class PianoPlayer {
    constructor() {
        this.piano = new Piano({ velocities: 4 }).toMaster();
    }

    async init() {
        await this.piano.load(SALAMANDER_URL);
    }

    noteOn(note, velocity) {
        this.piano.keyDown(note, Tone.now(), velocity / MAX_VELOCITY);
    }

    noteOff(note) {
        this.piano.keyUp(note);
    }
}
