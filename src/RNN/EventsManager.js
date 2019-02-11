import _ from 'lodash';

import {
    NOTE_ON, NOTE_OFF, TIME_SHIFT, VELOCITY_CHANGE,
} from './MelodyGenerator';

const START_VELOCITY = 100;
const MAX_VELOCITY = 127;
const MAX_NOTE_LENGTH = 3;


export default class EventsManager {
    constructor({ device, rnn, timeScale = 2 }) {
        this.device = device;
        this.rnn = rnn;
        this.timeScale = timeScale;
        this.events = [];

        this.device.$on(NOTE_ON, this.onDeviceNoteOn.bind(this));
        this.device.$on(NOTE_OFF, this.onDeviceNoteOff.bind(this));
    }

    generate(seconds) {
        this.events = [];
        let curSeconds = 0;
        while (curSeconds < seconds && this.events.length < 1000) {
            const event = this.rnn.generateStep();
            this.events.push(event);
            if (event.event === TIME_SHIFT) {
                curSeconds += event.value * this.timeScale;
            }
        }
    }

    play() {
        let velocity = START_VELOCITY;
        let time = 0;
        const activeNotes = {};
        const noteOn = this.device.noteOn.bind(this.device);
        const noteOff = this.device.noteOff.bind(this.device);

        this.events.forEach((event) => {
            switch (event.event) {
            case NOTE_ON:
                activeNotes[event.note] = time;
                _.delay(noteOn, time * 1000 * this.timeScale, event.note, velocity);
                break;
            case NOTE_OFF:
                if (_.has(activeNotes, event.note)) {
                    delete activeNotes[event.note];
                    _.delay(noteOff, time * 1000 * this.timeScale, event.note);
                }
                break;
            case TIME_SHIFT:
                time += event.value;
                _.forOwn(
                    _.pickBy(activeNotes, noteTime => (time - noteTime) >= MAX_NOTE_LENGTH),
                    (noteTime, note) => {
                        delete activeNotes[note];
                        _.delay(noteOff, time * 1000 * this.timeScale, note);
                    },
                );
                break;
            case VELOCITY_CHANGE:
                velocity = Math.min(event.value, MAX_VELOCITY);
                break;
            default:
                break;
            }
        });
        // TODO: noteOff all activeNotes in 3 seconds
    }

    onDeviceNoteOn(event) {
        console.log(this, event, 'onDeviceNoteOn');
    }

    onDeviceNoteOff(event) {
        console.log(this, event, 'onDeviceNoteOff');
    }
}