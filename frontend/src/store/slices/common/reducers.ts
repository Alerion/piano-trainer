import * as _ from 'lodash'

import { PayloadAction } from '@reduxjs/toolkit'

import initialState from './initialState'
import { CommonState, Language } from './types'


export default {
  reset(state: CommonState, action: PayloadAction<CommonState | null>) {
    _.assign(state, action.payload || initialState)
  },

  setLanguage(state: CommonState, action: PayloadAction<Language>) {
    state.language = action.payload
  },
}
