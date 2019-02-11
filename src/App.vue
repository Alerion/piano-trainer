<template>
    <div id="app">
        <b-navbar toggleable="false" type="dark" variant="success">
            <b-navbar-brand href="home">Piano Trainer</b-navbar-brand>
            <output-devices-selector></output-devices-selector>
        </b-navbar>

        <router-view></router-view>
    </div>
</template>

<script>
import OutputDevicesSelector from './components/OutputDevicesSelector.vue';


export default {
    components: {
        'output-devices-selector': OutputDevicesSelector,
    },
};
</script>

<style lang="scss">

</style>
