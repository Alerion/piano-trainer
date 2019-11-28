<template>
    <b-nav-text>
        <fa-icon icon="keyboard"></fa-icon>
        {{outputName}}
    </b-nav-text>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';


export default @Component
class InputDevicesSelector extends Vue {
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

<style lang="scss" scoped>
.navbar-text {
    margin: 0 3px;
}
</style>
