import PianoPlayer from './PianoPlayer';
import MIDIPlayer from './MIDIPlayer';
import MIDIInput from './MIDIInput';
import NoneInput from './NoneInput';
import { NOTE_ON, NOTE_OFF } from '../RNN/MelodyGenerator';


export default {
    install(Vue) {
        const MIDI = new Vue({
            data() {
                return {
                    piano: new PianoPlayer(),
                    inputs: [],
                    outputs: [],
                    currentInput: null,
                    currentOutput: null,
                };
            },

            async created() {
                const midi = await window.navigator.requestMIDIAccess();
                await this.setFromMIDIAccess(midi);
                midi.onstatechange = this.onStateChange;
            },

            methods: {
                async setFromMIDIAccess(midi) {
                    this.inputs = Array.from(midi.inputs.values());
                    this.outputs = Array.from(midi.outputs.values());

                    if (this.outputs.length) {
                        this.currentOutput = new MIDIPlayer({ output: this.outputs[0] });
                    } else {
                        this.currentOutput = this.piano;
                        await this.piano.init();
                    }

                    if (this.inputs.length) {
                        this.currentInput = new MIDIInput({
                            input: this.inputs[0],
                            onNoteOn: this.onNoteOn,
                            onNoteOff: this.onNoteOff,
                        });
                    } else {
                        this.currentInput = new NoneInput();
                    }
                },

                async onStateChange(event) {
                    await this.setFromMIDIAccess(event.target);
                },

                // Output methods
                noteOn(note, velocity) {
                    this.currentOutput.noteOn(note, velocity);
                },

                noteOff(note) {
                    this.currentOutput.noteOff(note);
                },

                // Input methods
                onNoteOn(note, velocity) {
                    this.$emit(NOTE_ON, {
                        event: NOTE_ON,
                        note,
                        velocity,
                    });
                },

                onNoteOff(note) {
                    this.$emit(NOTE_OFF, {
                        event: NOTE_OFF,
                        note,
                    });
                },
            },
        });

        Object.defineProperty(Vue.prototype, '$MIDI', {
            get() {
                return MIDI;
            },
        });
    },
};
