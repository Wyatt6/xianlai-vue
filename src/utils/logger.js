import { useOptionStore } from '@/stores/option'

export default {
  log: (...args) => {
    if (useOptionStore().data.console.openLog) {
      console.log(...args)
    }
  }
}
