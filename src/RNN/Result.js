import _ from 'lodash';
import { Frequency } from 'tone';

import {
    NOTE_ON, NOTE_OFF, TIME_SHIFT, VELOCITY_CHANGE,
} from './MelodyGenerator';


function isValid(events) {
    return _.every(events, event => event.isValid);
}


function prepareEvents(events) {
    return events.filter(event => event.event === NOTE_ON).map((event) => {
        return {
            note: Frequency(event.note, 'midi').toNote(),
            isValid: false,
        };
    });
}


export default class Result {
    constructor({ target }) {
        this.validInputs = [];
        this.currentInput = [];
        this.targets = prepareEvents(target);
        this.isValid = false;
    }

    addInputs(inputs) {
        const events = prepareEvents(inputs);
        const targets = this.targets.slice(this.validInputs.length);
        events.forEach((event, i) => {
            const target = targets[i];
            event.isValid = (target && target.note === event.note);
        });

        if (isValid(events)) {
            this.validInputs = this.validInputs.concat(events);
            this.currentInput = [];
        } else {
            this.currentInput = events;
        }

        if (this.validInputs.length === this.targets.length) {
            this.isValid = true;
        }
    }
}
