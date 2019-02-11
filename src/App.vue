<template>
    <div id="app">
        <b-navbar toggleable="sm" type="dark" variant="success">
            <b-navbar-brand href="home">Piano Trainer</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">
                <b-navbar-nav class="ml-auto">
                    <output-devices-selector></output-devices-selector>
                    <input-devices-selector></input-devices-selector>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>

        <router-view></router-view>
    </div>
</template>

<script>
import OutputDevicesSelector from './components/OutputDevicesSelector.vue';
import InputDevicesSelector from './components/InputDevicesSelector.vue';


export default {
    components: {
        'output-devices-selector': OutputDevicesSelector,
        'input-devices-selector': InputDevicesSelector,
    },
};
</script>

<style lang="scss">

</style>
