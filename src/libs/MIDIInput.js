const MIDI_EVENT_ON = 0x90;
const MIDI_EVENT_OFF = 0x80;


export default class MIDIInput {
    constructor({ input, onNoteOn, onNoteOff }) {
        this.name = input.name;
        this.input = input;
        this.onNoteOn = onNoteOn;
        this.onNoteOff = onNoteOff;
        this.input.onmidimessage = this.onMidiMessage.bind(this);
    }

    onMidiMessage(message) {
        const [command, note, velocity] = message.data;
        switch (command) {
        case MIDI_EVENT_ON:
            this.onNoteOn(note, velocity);
            break;
        case MIDI_EVENT_OFF:
            this.onNoteOff(note);
            break;
        default:
            break;
        }
    }
}
