import get from 'get-value'
import set from 'set-value'
import Vue, { VueConstructor } from 'vue'
import { Store } from 'redux'

import {
  PluginOptions, Props, Bindings, MappedState, ActionsProps,
} from './types'


function getStateGetter(prop: string): any {
  return (state: any) => {
    const value = get(state, prop)
    if (value === undefined) {
      throw Error(`"${prop}" contains undefined. Looks like you made mistake in property name 
                  or field contains undefined value what is bad practice`)
    }
    return value
  }
}


function copy(obj: any): any {
  return JSON.parse(JSON.stringify(obj))
}


function mapState(component: Vue, props: Props): MappedState {
  const slices = Object.keys(props)
  const state = component.$store.getState()
  const bindings: Bindings = {}
  const output: MappedState = {}

  Object.entries(props).forEach(([prop, getter]) => {
    if (typeof getter === 'string') {
      bindings[prop] = getStateGetter(getter)
    } else {
      bindings[prop] = getter
    }
    output[prop] = copy(bindings[prop](state))
  })

  // eslint-disable-next-line no-param-reassign
  component.$$bindings = bindings
  return output
}


function getSyncStateWithComponent(store: Store, component: Vue, bindings: Bindings) {
  return function SyncStateWithComponent() {
    const state = store.getState()
    Object.entries(bindings).forEach(([prop, getter]) => {
      const data = getter(state)

      // Vue returns Observable object so converting to JSON,
      // is the easiest way to get rid of the __ob__ mess.
      let prevData = null
      let curData = null
      let update = true
      try {
        prevData = JSON.stringify(get(component.$data, prop))
        curData = JSON.stringify(data)
        update = prevData !== curData
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(component.$vnode.tag, prop, error)
        }
      }
      // Send updates to the component only of data was changed.
      if (update) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(
            component.$vnode.tag,
            prop,
            prevData ? JSON.parse(prevData) : '<unknown>',
            curData ? JSON.parse(curData) : '<unknown>',
          )
        }
        set(component.$data, prop, copy(data))
      }
    })
  }
}

const getActionCaller = (action: string) => function actionCaller(this: Vue, ...args: any[]) {
  if (!this.$$actions[action]) {
    throw Error(`Undefined action ${action}`)
  }
  this.$store.dispatch(this.$$actions[action].apply(this, args))
}

const actionsObjectMappers = (actions: ActionsProps) => Object.keys(actions)
  .reduce((result, name) => Object.assign(result, {
    [name]: getActionCaller(actions[name]),
  }), {})

export const mapActions = (props: ActionsProps) => actionsObjectMappers(props)

const plugin = {
  install(Vue_: VueConstructor, options: PluginOptions): void {
    Vue_.mixin({
      beforeCreate(this: Vue) {
        this.$store = options.store
        this.$$actions = options.actions
        this.mapState = (props: Props) => mapState(this, props)
      },

      created(this: Vue) {
        // Root component should not interact with the store
        if (!this.$root) {
          return
        }

        // If the helper methods (mapState) registered store bindings, create subscriptions
        // Note: Vue will call subscription callback for each created component on any action
        //       no matter if the store was really changed
        if (this.$$bindings) {
          this.unsubscribe = options.store.subscribe(
            getSyncStateWithComponent(options.store, this, this.$$bindings),
          )
        }
      },

      beforeDestroy(this: Vue) {
        if (this.unsubscribe) {
          this.unsubscribe()
        }
      },
    })
  },
}

export default plugin
export * from './types'
