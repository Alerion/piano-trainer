import _ from 'lodash';

import { NOTE_ON, NOTE_OFF, TIME_SHIFT, VELOCITY_CHANGE } from './MelodyGenerator';

const START_VELOCITY = 100;
const MAX_VELOCITY = 127;
const MAX_NOTE_LENGTH = 3;


export default class EventsManager {
    constructor({ player, rnn, timeScale = 2 }) {
        this.player = player;
        this.rnn = rnn;
        this.timeScale = timeScale;
        this.events = [];
    }

    generate(seconds) {
        this.events = [];
        let curSeconds = 0;
        while (curSeconds < seconds && this.events.length < 1000) {
            const event = this.rnn.generateStep();
            this.events.push(event);
            if (event.event === TIME_SHIFT) {
                curSeconds += event.value;
            }
        }
    }

    play() {
        let velocity = START_VELOCITY;
        let time = 0;
        const activeNotes = {};
        const noteOn = this.player.noteOn.bind(this.player);
        const noteOff = this.player.noteOff.bind(this.player);

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
                        console.warn(`Note ${note} player longer then ${MAX_NOTE_LENGTH} seconds`)
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
    }
}
