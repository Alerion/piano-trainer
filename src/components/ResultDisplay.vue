<template>
    <b-container>
        <b-row>
            <b-col>
                <b-list-group>
                    <b-list-group-item variant="primary">
                        <strong>Song</strong>
                    </b-list-group-item>

                    <b-list-group-item v-for="event in validTargets">
                        {{ event.note }}
                    </b-list-group-item>

                    <b-list-group-item v-for="event in uncompletedTargets" variant="light">
                        ???
                    </b-list-group-item>
                </b-list-group>
            </b-col>
            <b-col>
                <b-list-group>
                    <b-list-group-item variant="primary">
                        <strong>Your play</strong>
                    </b-list-group-item>

                    <b-list-group-item v-for="event in result.validInputs" variant="info">
                        {{ event.note }}
                    </b-list-group-item>

                    <b-list-group-item v-for="event in result.currentInput"
                                       :variant="event.isValid ? 'success' : 'danger'">
                        {{ event.note }}
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';


export default @Component({
    props: {
        result: Object,
    },
})
class ResultDisplay extends Vue {

    get validTargets() {
        return this.result.targets.slice(0, this.result.validInputs.length);
    }

    get uncompletedTargets() {
        return this.result.targets.slice(this.result.validInputs.length);
    }
}
</script>

<style scoped>

</style>
