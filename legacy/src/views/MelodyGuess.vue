<template>
    <b-container fluid>
        <b-alert variant="danger" :show="error">{{error}}</b-alert>
        <b-alert :show="!ready && !error">Loading...</b-alert>

        <template v-if="!error && ready">
            <b-row>
                <b-col cols="3" class="sidebar">
                    <b-button @click="generate">Generate</b-button>
                    <b-button @click="play" class="btn-play">Play</b-button>
                    <b-alert :show="!!status">{{status}}</b-alert>
                </b-col>
                <b-col>
                    <b-alert :show="isCompleted" variant="success">Melody completed!</b-alert>
                    <result-display :result="result" v-if="result"></result-display>
                </b-col>
            </b-row>
        </template>
    </b-container>
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

    generateSeconds = 5;
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
            console.error(error);
            this.error = error.message;
        }
    }

    generate() {
        // TODO: Force status display
        this.status = 'Generating melody...';
        this.result = this.eventsManager.generate(this.generateSeconds);
        this.status = null;
        this.eventsManager.play();
        this.status = 'Enter melody please';
    }

    play() {
        if (!this.result) {
            this.generate();
        } else {
            this.eventsManager.play();
        }
    }

    get isCompleted() {
        return this.result && this.result.isValid;
    }
}
</script>

<style lang="scss" scoped>
.sidebar {
    .alert {
        margin-top: 10px;
    }

    .btn-play {
        margin-left: 10px;
    }
}
</style>
