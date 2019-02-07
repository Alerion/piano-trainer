<template>
  <div>
    <div v-if="error">{{error}}</div>
    <div v-else>
      <div v-if="!ready">Loading...</div>
      <div v-else>Ready!</div>
    </div>
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

  async created() {
    const generator = new RNNMelodyGenerator();
    try {
      await generator.init();
      this.ready = true;
    } catch (error) {
      this.error = error.message
    }
  }
}
</script>
