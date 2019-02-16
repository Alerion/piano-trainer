<template>
    <b-container>
        <b-row>
            <b-col>
                <b-list-group>
                    <b-list-group-item variant="primary">
                        <strong>Song</strong>
                    </b-list-group-item>
                    <b-list-group-item v-for="event in result.target">
                        {{ event.isValid ? event.note : '???' }}
                    </b-list-group-item>
                </b-list-group>
            </b-col>
            <b-col>
                <b-list-group>
                    <b-list-group-item variant="primary">
                        <strong>Your play</strong>
                    </b-list-group-item>
                    <b-list-group-item v-for="event in result.inputs"
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

}
</script>

<style scoped>

</style>
