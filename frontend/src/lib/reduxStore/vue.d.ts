/**
 * Extends interfaces in Vue.js
 */
import Vue from 'vue'
import { Store, Unsubscribe } from 'redux'

import { Actions, MapState, Bindings } from './types'


declare module 'vue/types/vue' {

  interface Vue {
    $store: Store,
    $$actions: Actions,
    $$bindings: Bindings,
    mapState: MapState,
    unsubscribe: Unsubscribe | undefined,
  }
}
