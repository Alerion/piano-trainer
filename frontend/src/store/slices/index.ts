import * as _ from 'lodash'

import { slice as commonSlice } from './common'


export const slices = [commonSlice]

export const reducer = _.fromPairs(slices.map(slice => [slice.name, slice.reducer]))
