import { createSlice } from '@reduxjs/toolkit'

import reducers from './reducers'
import initialState from './initialState'


export const slice = createSlice({
  name: 'common',
  initialState,
  reducers,
})
