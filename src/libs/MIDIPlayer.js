const MIDI_EVENT_ON = 0x90;
const MIDI_EVENT_OFF = 0x80;


export default class MIDIPlayer {
    constructor({ output }) {
        this.name = output.name;
        this.output = output;
        this.initalized = true; // Keep same intarface with outher players
    }

    noteOn(note, velocity) {
        this.output.send([MIDI_EVENT_ON, note, velocity]);
    }

    noteOff(note) {
        this.output.send([MIDI_EVENT_OFF, note, 0]);
    }
}
