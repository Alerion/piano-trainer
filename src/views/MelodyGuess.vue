<template>
    <div>
        <b-alert variant="danger" :show="error">{{error}}</b-alert>
        <b-alert :show="!ready && !error">Loading...</b-alert>

        <template v-if="!error && ready">
            <b-button @click="generate">Generate {{generateSeconds}} seconds</b-button>
            <b-alert :show="!!status">{{status}}</b-alert>
            <result-display :result="result" v-if="result"></result-display>
        </template>
    </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import MelodyGenerator from '../RNN/MelodyGenerator';
import EventsManager from '../RNN/EventsManager';
import ResultDisplay from '../components/ResultDisplay.vue';


export default @Component({
    components: {
        'result-display': ResultDisplay,
    },
})
class MelodyGuess extends Vue {
    ready = false;
    error = null;
    result = null;
    status = null;

    generateSeconds = 10;
    eventsManager = null;


    async created() {
        try {
            const rnn = new MelodyGenerator();
            await rnn.init();
            this.eventsManager = new EventsManager({
                device: this.$MIDI,
                onResult: this.onResult,
                rnn,
            });
            this.ready = true;
        } catch (error) {
            this.error = error.message;
        }
    }

    generate() {
        // TODO: Force status display
        this.status = 'Generating melody...';
        this.eventsManager.generate(this.generateSeconds);
        this.status = null;
        this.eventsManager.play();
        this.status = 'Enter melody please';
    }

    onResult(result) {
        this.result = result;
    }
}
</script>
