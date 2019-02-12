import * as tf from '@tensorflow/tfjs-core';

const NOTES_PER_OCTAVE = 12;
const PITCH_HISTOGRAM_SIZE = NOTES_PER_OCTAVE;
const DENSITY_BIN_RANGES = [1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0];
const MIN_MIDI_PITCH = 0;
const MAX_MIDI_PITCH = 127;
const VELOCITY_BINS = 32;
const MAX_SHIFT_STEPS = 100;
const STEPS_PER_SECOND = 100;

export const NOTE_ON = 'note_on';
export const NOTE_OFF = 'note_off';
export const TIME_SHIFT = 'time_shift';
export const VELOCITY_CHANGE = 'velocity_change';
const EVENT_RANGES = [
    [NOTE_ON, MIN_MIDI_PITCH, MAX_MIDI_PITCH],
    [NOTE_OFF, MIN_MIDI_PITCH, MAX_MIDI_PITCH],
    [TIME_SHIFT, 1, MAX_SHIFT_STEPS],
    [VELOCITY_CHANGE, 1, VELOCITY_BINS],
];
const EVENT_SIZE = EVENT_RANGES.reduce((size, eventRange) => {
    return size + (eventRange[2] - eventRange[1] + 1);
}, 0);
const PRIMER_IDX = 355; // shift 1s.
// How many steps to generate per generateStep call.
// Generating more steps makes it less likely that we'll lag behind in note
// generation. Generating fewer steps makes it less likely that the browser UI
// thread will be starved for cycles.
const STEPS_PER_GENERATE_CALL = 10;


export default class MelodyGenerator {
    // MODEL_URL = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/performance_rnn/tfjs';
    MODEL_URL = '/rnn/';

    constructor() {
        this.noteDensityIdx = 1;
        // C major: [2, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
        // F major: [1, 0, 1, 0, 1, 2, 0, 1, 0, 1, 1, 0]
        // D minor: [1, 0, 2, 0, 1, 1, 0, 1, 0, 1, 1, 0]
        // Whole ton: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
        // Pentatonic: [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
        this.pitchHistogram = [2, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
        this.conditioning = this.calcConditioning();

        this.fcB = null;
        this.fcW = null;
        this.c = null;
        this.h = null;
        this.lastSample = null;
    }

    async init() {
        if (!tf.ENV.get('WEBGL_VERSION') >= 1) {
            throw new Error(`We do not yet support your device. Please try on a desktop
                computer with Chrome/Firefox, or an Android phone with WebGL support.`);
        }

        const response = await fetch(`${this.MODEL_URL}/weights_manifest.json`);
        const manifest = await response.json();
        const vars = await tf.loadWeights(manifest, this.MODEL_URL);
        this.kernel1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/kernel'];
        this.bias1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/bias'];
        this.kernel2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/kernel'];
        this.bias2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/bias'];
        this.kernel3 = vars['rnn/multi_rnn_cell/cell_2/basic_lstm_cell/kernel'];
        this.bias3 = vars['rnn/multi_rnn_cell/cell_2/basic_lstm_cell/bias'];
        this.forgetBias = tf.scalar(1.0);

        this.fcB = vars['fully_connected/biases'];
        this.fcW = vars['fully_connected/weights'];
        // Reset RNN
        this.c = [
            tf.zeros([1, this.bias1.shape[0] / 4]),
            tf.zeros([1, this.bias2.shape[0] / 4]),
            tf.zeros([1, this.bias3.shape[0] / 4]),
        ];
        this.h = [
            tf.zeros([1, this.bias1.shape[0] / 4]),
            tf.zeros([1, this.bias2.shape[0] / 4]),
            tf.zeros([1, this.bias3.shape[0] / 4]),
        ];
        this.lastSample = tf.scalar(PRIMER_IDX, 'int32');
    }

    calcConditioning() {
        const noteDensityEncoding = tf.oneHot(
            tf.tensor1d([this.noteDensityIdx + 1], 'int32'),
            DENSITY_BIN_RANGES.length + 1,
        ).as1D();
        const buffer = tf.buffer([PITCH_HISTOGRAM_SIZE], 'float32');
        const pitchHistogramTotal = this.pitchHistogram.reduce((prev, val) => {
            return prev + val;
        });
        for (let i = 0; i < PITCH_HISTOGRAM_SIZE; i++) {
            buffer.set(this.pitchHistogram[i] / pitchHistogramTotal, i);
        }
        const pitchHistogramEncoding = buffer.toTensor();

        return tf.tidy(() => {
            const axis = 0;
            const conditioningValues = noteDensityEncoding.concat(pitchHistogramEncoding, axis);
            return tf.tensor1d([0], 'int32').concat(conditioningValues, axis);
        });
    }

    generateSteps() {
        const {
            fcB, fcW, conditioning, forgetBias, kernel1, kernel2, kernel3, bias1, bias2, bias3,
        } = this;
        const lstm1 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel1, bias1, data, c, h);
        const lstm2 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel2, bias2, data, c, h);
        const lstm3 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel3, bias3, data, c, h);
        let { c, h, lastSample } = this;
        let outputs = [];


        [this.c, this.h, this.lastSample, outputs] = tf.tidy(() => {
            // Generate some notes.
            const innerOuts = [];
            for (let i = 0; i < STEPS_PER_GENERATE_CALL; i++) {
                // Use last sampled output as the next input.
                const eventInput = tf.oneHot(lastSample.as1D(), EVENT_SIZE).as1D();
                // Dispose the last sample from the previous generate call, since we kept it.
                if (i === 0) {
                    lastSample.dispose();
                }

                const axis = 0;
                const input = conditioning.concat(eventInput, axis).toFloat();
                const output = tf.multiRNNCell([lstm1, lstm2, lstm3], input.as2D(1, -1), c, h);
                c.forEach(item => item.dispose());
                h.forEach(item => item.dispose());
                [c, h] = output;

                const outputH = h[2];
                const logits = outputH.matMul(fcW).add(fcB);

                const sampledOutput = tf.multinomial(logits.as1D(), 1).asScalar();

                innerOuts.push(sampledOutput);
                lastSample = sampledOutput;
            }
            return [c, h, lastSample, innerOuts];
        });
        return outputs.map(item => this.decodeSample(item.dataSync()[0]));
    }

    decodeSample(index) {
        let offset = 0;
        for (const eventRange of EVENT_RANGES) {
            const [eventType, minValue, maxValue] = eventRange;
            if (offset <= index && index <= offset + maxValue - minValue) {
                switch (eventType) {
                case NOTE_ON:
                case NOTE_OFF:
                    return {
                        event: eventType,
                        note: index - offset,
                    };
                case TIME_SHIFT:
                    return {
                        event: eventType,
                        value: (index - offset + 1) / STEPS_PER_SECOND,
                    };
                case VELOCITY_CHANGE:
                    return {
                        event: eventType,
                        value: (index - offset + 1) * Math.ceil(127 / VELOCITY_BINS),
                    };
                default:
                    throw new Error(`Could not decode eventType: ${eventType}`);
                }
            }
            offset += maxValue - minValue + 1;
        }
        throw new Error(`Could not decode index: ${index}`);
    }
}
