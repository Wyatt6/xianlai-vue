/**
 * 系统参数使用方法：
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
import { createAxiosInstance } from './instance'
import { isEmpty, hasText, notEmpty } from '@/utils/common'

const apiList = [
  {
    description: '获取初始化数据',
    callPath: 'common.init.getInitData',
    requestMethod: 'get',
    url: '/api/common/init/getInitData'
  },
  {
    description: '获取验证码',
    callPath: 'common.captcha.getCaptcha',
    requestMethod: 'get',
    url: '/api/common/captcha/getCaptcha'
  }
  //   {
  //     description: '注册新用户',
  //     callPath: 'iam.user.register',
  //     requestMethod: 'post',
  //     url: '/api/iam/user/register'
  //   },
  //   {
  //     description: '用户登录',
  //     callPath: 'iam.user.login',
  //     requestMethod: 'post',
  //     url: '/api/iam/user/login'
  //   }
]

export const useApiStore = defineStore('api', () => {
  const request = ref({})

  function evalData() {
    const axiosInstance = createAxiosInstance()
    for (let i = 0; i < apiList.length; i++) {
      const { callPath, requestMethod, url, description } = apiList[i]
      const paths = callPath.split('.')
      let now = request.value
      for (let j = 0; j < paths.length; j++) {
        if (j == paths.length - 1) {
          now[paths[j]] = (requestParams, requestData) => {
            const config = { method: requestMethod, url: url }
            if (hasText(description)) config.desc = description
            if (notEmpty(requestParams)) config.params = requestParams
            if (notEmpty(requestData)) config.data = requestData
            return axiosInstance(config)
          }
        } else {
          if (isEmpty(now[paths[j]])) now[paths[j]] = {}
          now = now[paths[j]]
        }
      }
    }
  }

  return {
    request,
    evalData
  }
})
