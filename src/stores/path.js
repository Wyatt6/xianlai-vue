/**
 * 系统路径使用方法：
 * const Path = usePathStore()
 * Path.data.xxx.xxx
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePathStore = defineStore('path', () => {
  const data = ref({})
  const checksum = ref(null)

  /**
   * 系统路径赋值函数
   */
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
