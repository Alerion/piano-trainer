import * as tf from '@tensorflow/tfjs-core';

const NOTES_PER_OCTAVE = 12;
const PITCH_HISTOGRAM_SIZE = NOTES_PER_OCTAVE;
const DENSITY_BIN_RANGES = [1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0];
const MIN_MIDI_PITCH = 0;
const MAX_MIDI_PITCH = 127;
const VELOCITY_BINS = 32;
const MAX_SHIFT_STEPS = 100;
const STEPS_PER_SECOND = 100;

const EVENT_RANGES = [
    ['note_on', MIN_MIDI_PITCH, MAX_MIDI_PITCH],
    ['note_off', MIN_MIDI_PITCH, MAX_MIDI_PITCH],
    ['time_shift', 1, MAX_SHIFT_STEPS],
    ['velocity_change', 1, VELOCITY_BINS],
];
const EVENT_SIZE = EVENT_RANGES.reduce((size, eventRange) => {
    return size + (eventRange[2] - eventRange[1] + 1);
}, 0);
const PRIMER_IDX = 355; // shift 1s.

export default class RNNMelodyGenerator {
    MODEL_URL = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/performance_rnn/tfjs';

    constructor() {
        this.noteDensityIdx = 0;
        this.pitchHistogram = [2, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
        this.conditioning = this.calcConditioning();
        this.lstm1 = null;
        this.lstm2 = null;
        this.lstm3 = null;
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
        const kernel1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/kernel'];
        const bias1 = vars['rnn/multi_rnn_cell/cell_0/basic_lstm_cell/bias'];
        const kernel2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/kernel'];
        const bias2 = vars['rnn/multi_rnn_cell/cell_1/basic_lstm_cell/bias'];
        const kernel3 = vars['rnn/multi_rnn_cell/cell_2/basic_lstm_cell/kernel'];
        const bias3 = vars['rnn/multi_rnn_cell/cell_2/basic_lstm_cell/bias'];
        const forgetBias = tf.scalar(1.0);

        this.lstm1 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel1, bias1, data, c, h);
        this.lstm2 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel2, bias2, data, c, h);
        this.lstm3 = (data, c, h) => tf.basicLSTMCell(forgetBias, kernel3, bias3, data, c, h);

        this.fcB = vars['fully_connected/biases'];
        this.fcW = vars['fully_connected/weights'];
        // Reset RNN
        this.c = [
            tf.zeros([1, bias1.shape[0] / 4]),
            tf.zeros([1, bias2.shape[0] / 4]),
            tf.zeros([1, bias3.shape[0] / 4]),
        ];
        this.h = [
            tf.zeros([1, bias1.shape[0] / 4]),
            tf.zeros([1, bias2.shape[0] / 4]),
            tf.zeros([1, bias3.shape[0] / 4]),
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
            const size = 1 + noteDensityEncoding.shape[0] + pitchHistogramEncoding.shape[0];
            return tf.oneHot(tf.tensor1d([0], 'int32'), size).as1D();
        });
    }

    generateStep() {
        [this.c, this.h, this.lastSample] = tf.tidy(() => {
            // Use last sampled output as the next input.
            const eventInput = tf.oneHot(this.lastSample.as1D(), EVENT_SIZE).as1D();
            const axis = 0;
            const input = this.conditioning.concat(eventInput, axis).toFloat();
            const output = tf.multiRNNCell(
                [this.lstm1, this.lstm2, this.lstm3], input.as2D(1, -1), this.c, this.h,
            );
            const outputH = this.h[2];
            const logits = outputH.matMul(this.fcW).add(this.fcB);
            const sampledOutput = tf.multinomial(logits.as1D(), 1).asScalar();

            this.c.forEach(c => c.dispose());
            this.h.forEach(h => h.dispose());
            this.lastSample.dispose();

            return [output[0], output[1], sampledOutput];
        });
        return this.decodeSample(this.lastSample.dataSync()[0]);
    }

    decodeSample(index) {
        let offset = 0;
        for (const eventRange of EVENT_RANGES) {
            const [eventType, minValue, maxValue] = eventRange;
            if (offset <= index && index <= offset + maxValue - minValue) {
                if (eventType === 'note_on') {
                    return {
                        event: eventType,
                        note: index - offset,
                    };
                } else if (eventType === 'note_off') {
                    return {
                        event: eventType,
                        note: index - offset,
                    };
                } else if (eventType === 'time_shift') {
                    return {
                        event: eventType,
                        shift: (index - offset + 1) / STEPS_PER_SECOND,
                    };
                } else if (eventType === 'velocity_change') {
                    return {
                        event: eventType,
                        velocity: (index - offset + 1) * Math.ceil(127 / VELOCITY_BINS),
                    };
                } else {
                    throw new Error(`Could not decode eventType: ${eventType}`);
                }
            }
            offset += maxValue - minValue + 1;
        }
        throw new Error(`Could not decode index: ${index}`);
    }
}
