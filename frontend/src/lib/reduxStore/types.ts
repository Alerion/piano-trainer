import { Store } from 'redux'


export type Actions = Record<string, (...args: any[]) => any>
export type StateGetter = (state: any) => any
export type Props = Record<string, StateGetter | string>
export type MapState = (props: Props) => MappedState
export type Bindings = Record<string, StateGetter>
export type MappedState = Record<string, any>

export type ActionsProps = Record<string, string>
export type MappedActions = Record<string, (actionName: string) => void>

export interface PluginOptions {
  actions: Actions,
  store: Store,
}
