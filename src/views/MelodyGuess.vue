<template>
    <div>
        <b-alert variant="danger" :show="error">{{error}}</b-alert>
        <b-alert :show="!ready && !error">Loading...</b-alert>

        <template v-if="!error && ready">
            <b-button @click="generate">Generate {{tonesPerIteration}} tones</b-button>
        </template>
    </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import RNNMelodyGenerator from '@/melody/RNNMelodyGenerator';


export default @Component
class MelodyGuess extends Vue {
    ready = false;
    error = null;
    tonesPerIteration = 20;
    rnn = null;

    async created() {
        this.rnn = new RNNMelodyGenerator();
        try {
            await this.rnn.init();
            this.ready = true;
        } catch (error) {
            this.error = error.message;
        }
    }

    generate() {
        console.log(this.rnn.generateStep());
    }
}
</script>
