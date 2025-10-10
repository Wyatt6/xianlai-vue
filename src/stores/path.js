/**
 * 系统路径使用方法：
 * const SysPath = useSysPathStore()
 * SysPath.data.xxx.xxx
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSysPathStore = defineStore('sysPath', () => {
  const data = ref({})
  const checksum = ref(null)

  async function evalData(pathData, checksumData) {
    checksum.value = checksumData
    pathData.forEach(item => {
      data.value[item.name] = item.path
    })
  }

  return {
    data,
    checksum,
    evalData
  }
})
