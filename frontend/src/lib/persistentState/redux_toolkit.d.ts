import * as toolkit from '@reduxjs/toolkit'


declare module '@reduxjs/toolkit' {
  interface Slice {
    initialState: Record<string, any>,
    persistent?: string[] | string,
  }
}
