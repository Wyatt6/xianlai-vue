import { useSysOptionStore } from '@/stores/sys_option'

export default {
  log: (...args) => {
    if (useSysOptionStore().data.console.openLog) {
      console.log(...args)
    }
  }
}
