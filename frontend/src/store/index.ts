import * as _ from 'lodash'
import { configureStore } from '@reduxjs/toolkit'

import { Actions } from '@/lib/reduxStore/types'
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
