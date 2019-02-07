import * as tf from '@tensorflow/tfjs-core';


export default class RNNMelodyGenerator {
  MODEL_URL = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/performance_rnn/tfjs';

  constructor() {
    this.lstm1 = null;
    this.lstm2 = null;
    this.lstm3 = null;
    this.fcB = null;
    this.fcW = null;
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
  }
}
