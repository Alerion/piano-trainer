import PianoPlayer from './PianoPlayer';
import MIDIPlayer from './MIDIPlayer';


export default {
    install(Vue) {
        const MIDI = new Vue({
            data() {
                return {
                    piano: new PianoPlayer(),
                    currentOutput: null,
                    inputs: [],
                    outputs: [],
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
            },
        });

        Object.defineProperty(Vue.prototype, '$MIDI', {
            get() {
                return MIDI;
            },
        });
    },
};
