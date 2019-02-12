<template>
<div>{{result}}</div>
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
