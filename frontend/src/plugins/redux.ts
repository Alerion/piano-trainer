import Vue from 'vue'
import reduxStore, { PluginOptions } from '@/lib/reduxStore'

import { store, actions } from '@/store'


const options: PluginOptions = {
  store,
  actions,
}

Vue.use(reduxStore, options)
