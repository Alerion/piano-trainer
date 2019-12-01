import { createSlice } from '@reduxjs/toolkit'

import reducers from './reducers'
import initialState from './initialState'


export const slice = createSlice({
  name: 'common',
  initialState,
  reducers,
})

const persistent: Array<keyof typeof initialState> = ['language'] // Use type for keys checking

slice.persistent = persistent
slice.initialState = initialState
