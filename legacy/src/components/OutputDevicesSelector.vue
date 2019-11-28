<template>
    <b-nav-text>
        <fa-icon icon="volume-up"></fa-icon>
        {{inputName}}
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

    get inputName() {
        if (this.devices.currentInput) {
            return this.devices.currentInput.name;
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
