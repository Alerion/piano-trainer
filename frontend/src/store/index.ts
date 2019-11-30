import * as _ from 'lodash'
import { configureStore } from '@reduxjs/toolkit'

import { Actions } from '@/lib/reduxStore'
import { slices, reducer } from './slices'


export const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
})

export const actions: Actions = {}

slices.forEach((slice) => {
  Object.values(slice.actions).forEach((action) => {
    actions[action.type] = action
  })
})

// For simpler import keep this here
export { mapActions } from '@/lib/reduxStore'
