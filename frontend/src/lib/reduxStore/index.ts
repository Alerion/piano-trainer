import { VueConstructor } from 'vue'
import { PluginOptions } from './types'


const plugin = {
  install(vue: VueConstructor, options: PluginOptions) {
    console.log(options)
  },
}

export default plugin
export * from './types'
