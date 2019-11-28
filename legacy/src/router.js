import Vue from 'vue';
import Router from 'vue-router';
import MelodyGuess from './views/MelodyGuess.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: MelodyGuess,
        },
    ],
});
