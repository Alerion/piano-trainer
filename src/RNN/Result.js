import { Frequency } from 'tone';
import { NOTE_ON, NOTE_OFF, TIME_SHIFT, VELOCITY_CHANGE } from './MelodyGenerator';


export default class Result {
    constructor({ inputs, target }) {
        this.inputs = this.cleanInputs(inputs);
        this.target = this.cleanTarget(target);
        this.isValid = false;
        this.compare();
    }

    compare() {
        this.inputs.forEach((event, i) => {
            const target = this.target[i];
            event.isValid = target.isValid = (target && target.note === event.note);
        });

        this.isValid = _.every(this.target, event => event.isValid);
    }

    cleanTarget(target) {
        return target.filter(event => event.event === NOTE_ON).map((event) => {
            return {
                note: Frequency(event.note, 'midi').toNote(),
                isValid: false,
            };
        });
    }

    cleanInputs(inputs) {
        return inputs.filter(event => event.event === NOTE_ON).map((event) => {
            return {
                note: Frequency(event.note, 'midi').toNote(),
                isValid: false,
            };
        });
    }
}
