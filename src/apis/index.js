/**
 * API使用方法：
 * const Api = useApiStore()
 * Api.request.xxx.xxx(params, data)
 *    .then(result => {
 *    })
 *    .catch(error => {
 *    })
 *    .finally(() => {
 *    })
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isEmpty, hasText, notEmpty } from '@/utils/common'
import { createAxiosInstance } from './instance'

export const useApiStore = defineStore('api', () => {
  const request = ref({})
  const checksum = ref(null)

  /**
   * 系统接口赋值函数
   */
  async function evalData(apiData, checksumData) {
    checksum.value = checksumData
    const axiosInstance = createAxiosInstance()
    if (notEmpty(apiData)) {
      apiData.forEach(item => {
        const { callPath, requestMethod, url, description } = item
        const paths = callPath.split('.')
        let now = request.value
        for (let i = 0; i < paths.length; i++) {
          if (i == paths.length - 1) {
            now[paths[i]] = (requestParams, requestData) => {
              const config = { method: requestMethod, url: url }
              if (hasText(description)) config.desc = description
              if (notEmpty(requestParams)) config.params = requestParams
              if (notEmpty(requestData)) config.data = requestData
              return axiosInstance(config)
            }
          } else {
            if (now[paths[i]] == null) now[paths[i]] = {}
            now = now[paths[i]]
          }
        }
      })
    }
  }

  return {
    request,
    checksum,
    evalData
  }
})
