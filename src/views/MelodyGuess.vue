<template>
    <div>
        <b-alert variant="danger" :show="error">{{error}}</b-alert>
        <b-alert :show="!ready && !error">Loading...</b-alert>

        <template v-if="!error && ready">
            <b-button @click="generate">Generate {{generateSeconds}} seconds</b-button>
        </template>
    </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

import MelodyGenerator from '@/RNN/MelodyGenerator';
import EventsManager from '@/RNN/EventsManager';
import PianoPlayer from '@/melody/PianoPlayer';


export default @Component
class MelodyGuess extends Vue {
    ready = false;
    error = null;
    generateSeconds = 5;
    eventsManager = null;

    async created() {
        try {
            const rnn = new MelodyGenerator();
            const piano = new PianoPlayer();
            await rnn.init();
            await piano.init();
            this.eventsManager = new EventsManager({ player: piano, rnn });
            this.ready = true;
        } catch (error) {
            this.error = error.message;
        }
    }

    generate() {
        this.eventsManager.generate(this.generateSeconds);
        this.eventsManager.play();
    }
}
</script>
