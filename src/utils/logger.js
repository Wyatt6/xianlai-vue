import { useOptionStore } from '@/stores/option'

export default {
  log: (...args) => {
    if (useOptionStore().data.console.openLog) {
      console.log(...args)
    }
  },
  groupCollapsed: (...args) => {
    if (useOptionStore().data.console.openLog) {
      console.groupCollapsed(...args)
    }
  },
  groupEnd: (...args) => {
    if (useOptionStore().data.console.openLog) {
      console.groupEnd(...args)
    }
  }
}
