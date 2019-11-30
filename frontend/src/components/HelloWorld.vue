<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <v-flex xs12>
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        ></v-img>
        <v-btn
          @click="setLanguage(`new lang: ${i++}`)"
        >Change lang</v-btn>
      </v-flex>

      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">
          {{ language }}
        </h1>
        <p class="subheading font-weight-regular">
          For help and collaboration with other Vuetify developers,
          <br>please join our online
          <a href="https://community.vuetifyjs.com" target="_blank">Discord Community</a>
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

import { mapActions } from '@/store'


export default Vue.extend({
  name: 'HelloWorld',

  data() {
    return {
      i: 1,
      ...this.mapState({
        language: 'common.language',
        isLoading: 'common.isLoading',
      }),
    }
  },

  methods: {
    ...mapActions({
      setLanguage: 'common/setLanguage',
    }),
  },
})
</script>
