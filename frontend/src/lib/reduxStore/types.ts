import { Action, Store } from 'redux'

export type Actions = Record<string, Action>

export interface PluginOptions {
  actions: Actions,
  store: Store,
}
