<template>
    <b-nav-text>{{outputName}}</b-nav-text>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';

export default @Component
class OutputDevicesSelector extends Vue {
    devices = null;

    created() {
        this.devices = this.$MIDI;
    }

    get outputName() {
        const output = this.devices.currentOutput;
        if (output && output.initalized) {
            return output.name;
        }
        return 'Loading...';
    }
}
</script>
