import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores/system'
import { useOptionStore } from '@/stores/option'
// import router from '@/router'
import Token from '@/utils/token'
import Logger from '@/utils/logger'
import RequestLogger from './request_logger'
import { notEmpty, hasText } from '@/utils/common'

export function createAxiosInstance() {
  const System = useSystemStore()
  const Option = useOptionStore()
  // axios 配置详见：https://www.axios-http.cn/docs/req_config
  const instance = axios.create({
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    timeout: Option.data.request.timeout
    // ...其他配置使用axios的默认值
  })
  // 添加请求拦截器
  instance.interceptors.request.use(
    /**
     * 在发送请求之前做些什么
     */
    async function (config) {
      if (Token.hasToken()) {
        if (Token.isExpired()) {
          Logger.log('登录已过期，重定向到登录页面')
          await System.resetStoreAndStorage()
          router.push('/portal/login')
          return Promise.reject(new Error('登录已过期，请重新登录'))
        } else {
          config.headers.token = `${Token.getToken()}` // 在报文头中注入token
        }
      }
      RequestLogger.send.info(config)
      return config
    },
    /**
     * 对请求错误做些什么
     */
    function (error) {
      RequestLogger.send.error(error, '网络错误')
      ElMessage.error('网络错误')
      return Promise.reject(error)
    }
  )
  // 添加响应拦截器
  instance.interceptors.response.use(
    /**
     * 2xx 范围内的状态码都会触发该函数
     * 仅代表了技术上成功返回（状态码2xx），但响应报文可能是业务成功处理，也可能是系统错误或者业务处理异常
     */
    async function (response) {
      const config = response.config
      const result = response.data
      RequestLogger.receive.info(config, result)

      if (notEmpty(result.data) && notEmpty(result.data.checksum) && System.isChecksumChange(result.data.checksum)) {
        Logger.log('初始化数据checksum发生变化，重新获取初始化数据')
        await System.initialize()
      }

      if (!result.success && notEmpty(result.data) && hasText(result.data.failCode)) {
        // 分支1: 后端返回有错误码时统一处理
        // TODO
        //         // 401-未登录：清除缓存，重定向到登录页面
        //         if (result.data.code === 401) {
        //           Logger.log('401-登录已过期，跳转到登陆页面')
        //           ElMessage.error('登录已过期，请重新登录')
        //           System.setLogoutLock()
        //           await System.resetStoreAndStorage()
        //           await router.push('/portal/login')
        //           System.releaseLogoutLock()
        //           return Promise.reject(new Error('登录已过期，请重新登录'))
        //         }
        //         // 其他只需要提示的错误：400-请求参数错误、403-用户权限不足、500-服务器内部错误
        //         if (result.data.code === 400 || result.data.code === 500) {
        //           if (result.message) {
        //             ElMessage.error(result.message)
        //             return Promise.reject(new Error(result.message))
        //           } else {
        //             ElMessage.error('' + result.data.code + '错误')
        //             return Promise.reject(new Error(result.data.code))
        //           }
        //         }

        //       // 401-未登录：清除缓存，重定向到登录页面
        //       if (res.data.code === 401) {
        //         console.log('401-登录已过期，跳转到登陆页面')
        //         ElMessage.error('登录已过期，请重新登录')
        //         appStore.setLogoutLock()
        //         await appStore.initialize()
        //         console.groupEnd()
        //         await Router.push(Routes.LOGIN)
        //         appStore.releaseLogoutLock()
        //         return Promise.reject(new Error('登录已过期，请重新登录'))
        //       }
        //       // 其他只需要提示的错误：400-请求参数错误、403-用户权限不足、500-服务器内部错误
        //       if (res.data.code === 400 || res.data.code === 500) {
        //         if (res.message) {
        //           ElMessage.error(res.message)
        //           return Promise.reject(new Error(res.message))
        //         } else {
        //           ElMessage.error('' + res.data.code + '错误')
        //           return Promise.reject(new Error(res.data.code))
        //         }
        //       }

        // 对于以上集中错误处理以外未列出的情况，返回给调用方处理
        return result
      } else {
        // 分支2: 后端返回没有错误码时，不论业务成功与否（success=true/false）都返回给调用方处理
        Logger.log('向调用方返回响应结果')
        return result
      }
    },
    /**
     * 超出 2xx 范围的状态码都会触发该函数
     * 技术上返回失败，即并不是由后端应用系统返回的错误，而是没能发到服务器或服务器层次返回的标准网络错误，如：500-服务器连接失败
     * 对于这些标准化错误，在这里统一打印日志、显示提示信息，不需要调用方在catch块处理
     */
    function (error) {
      let message = error.message
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码（并不是由后端应用程序返回的），但状态码非2xx
        const status = error.response.status
        switch (status) {
          case 500:
            message = '服务器内部错误'
            break
        }
        RequestLogger.receive.error(error, message)
      } else if (error.request) {
        // 请求已经成功发起，但没有收到服务器响应
        if (error.code === 'ECONNABORTED') {
          message = '服务器连接超时'
        }
        Logger.send.error(error, message)
      }
      ElMessage.error(message)
      // 这里一定要向调用方reject，调用方可以不写catch子句或catch子句为空去忽略，因为上面已经统一处理过了
      // 但是如果不写return语句或返回普通值，则是作为调用方的then()函数的输入参数值，可能会干扰then()里正常的业务逻辑
      return Promise.reject(error)
    }
  )
  return instance
}
