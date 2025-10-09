/**
 * 系统参数使用方法：
 * const SysOption = useSysOptionStore()
 * SysOption.data.xxx.xxx
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { hasText, isEmpty } from '@/utils/common'

export const useSysOptionStore = defineStore('sysOption', () => {
  const data = ref({
  })
  const checksum = ref(null)

  async function evalData(optionData, checksumData) {
    checksum.value = checksumData
    Object.entries(optionData).forEach(([key, valueObj]) => {
      if (hasText(valueObj.type) && hasText(valueObj.value)) {
        const keys = key.split('.')
        let now = data.value
        for (let i = 0; i < keys.length; i++) {
          if (i == keys.length - 1) {
            if (valueObj.type === 'BOOLEAN') {
              const boolExp = new RegExp('^true$', 'i')
              now[keys[i]] = boolExp.test(valueObj.value)
            }
            if (valueObj.type === 'NUMBER') {
              now[keys[i]] = Number(valueObj.value)
            }
            if (valueObj.type === 'STRING') {
              now[keys[i]] = valueObj.value
            }
          } else {
            if (isEmpty(now[keys[i]])) now[keys[i]] = {}
            now = now[keys[i]]
          }
        }
      }
    })
  }

  return {
    data,
    checksum,
    evalData
  }
})
