import * as _ from 'lodash'
import { configureStore, createSerializableStateInvariantMiddleware } from '@reduxjs/toolkit'

import { Actions } from '@/lib/reduxStore'
import { getPersistentStateLoader, getSaveToStoreMiddleware } from '@/lib/persistentState'
import { slices, reducer } from './slices'

// Now used only as a prefix for saving in localStore.
// Number is added to reset saved state after incompatible changes.
const WORKSPACE_ID = 'pt1'

// Init Store middlewares
const saveToLocalStoreMiddleware = getSaveToStoreMiddleware(WORKSPACE_ID, slices)
let middleware = [saveToLocalStoreMiddleware]

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line
  const createImmutableStateInvariantMiddleware = require('redux-immutable-state-invariant').default
  middleware = [
    createImmutableStateInvariantMiddleware(),
    // epicMiddleware,
    createSerializableStateInvariantMiddleware({
      getEntries: (value) => {
        // Do not check meta field for action. It may contains functions
        // Meta fields can be used to create success/error callbacks
        if (value.type && value.payload && value.meta) {
          return _.entries(_.omit(value, 'meta'))
        }
        return _.entries(value)
      },
    }),
    saveToLocalStoreMiddleware,
  ]
}

// Load state from localStore
const loadPersistentState = getPersistentStateLoader(slices)

// Create Store
export const store = configureStore({
  reducer,
  middleware,
  preloadedState: loadPersistentState(WORKSPACE_ID),
  devTools: process.env.NODE_ENV !== 'production',
})

// Combine all actions for reduxStore to Vue plugin
export const actions: Actions = {}

slices.forEach((slice) => {
  Object.values(slice.actions).forEach((action) => {
    actions[action.type] = action
  })
})

// Keep all store related imports here this here
export { mapActions } from '@/lib/reduxStore'
