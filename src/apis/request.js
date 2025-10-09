//axios 配置详见：https://www.axios-http.cn/docs/req_config
import Axios from 'axios'
import { ElMessage } from 'element-plus'
import Logger from './request_logger'
import Token from '@/utils/token'
import Router from '@/router'
import Routes from '@/router/routes'
import { useAppStore } from '@/stores/app'

/**
 * 创建后端服务访问对象
 *
 * method: 默认请求方法
 * baseURL: 自动添加的请求url前缀
 * headers: 请求头信息
 * responseType: 返回数据类型
 * timeout: 请求超时时间，单位毫秒
 */
const service = Axios.create({
  method: 'GET',
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  responseType: 'json',
  timeout: 30000
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  request => {
    const appStore = useAppStore()
    if (Token.hasToken()) {
      if (Token.isExpired()) {
        console.log('登录已过期，重定向到登录页面')
        appStore.initialize()
        Router.push(Routes.LOGIN)
        return Promise.reject(new Error('登录已过期，请重新登录'))
      } else {
        request.headers.token = `${Token.getToken()}` // Sa-Token框架要求在报文头中注入token
      }
    }
    Logger.send.info(request)
    return request // 必须返回request对象
  },
  error => {
    Logger.send.error(error, '网络请求发送失败')
    ElMessage.error('网络请求发送失败')
  }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  /**
   * 1.网络请求成功
   * 即技术上成功返回（状态码200），但响应报文可能是业务成功处理，也可能是系统错误或者业务处理异常
   */
  async response => {
    const config = response.config
    const res = response.data
    Logger.receive.info(config, res)
    if (!res.success && res.data && res.data.code) {
      const appStore = useAppStore()
      // 1.1.后端抛出系统错误，错误码封装在res.data.code
      // 401-未登录：清除缓存，重定向到登录页面
      if (res.data.code === 401) {
        console.log('401-登录已过期，跳转到登陆页面')
        ElMessage.error('登录已过期，请重新登录')
        appStore.setLogoutLock()
        await appStore.initialize()
        console.groupEnd()
        await Router.push(Routes.LOGIN)
        appStore.releaseLogoutLock()
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }
      // 其他只需要提示的错误：400-请求参数错误、403-用户权限不足、500-服务器内部错误
      if (res.data.code === 400 || res.data.code === 500) {
        if (res.message) {
          ElMessage.error(res.message)
          return Promise.reject(new Error(res.message))
        } else {
          ElMessage.error('' + res.data.code + '错误')
          return Promise.reject(new Error(res.data.code))
        }
      }

      return res // 对于以上集中错误处理以外未列出的情况，返回给调用方处理
    } else {
      // 1.2.后端没有抛出系统错误（但可能有业务错误，业务错误也是视作请求成功的，应交由调用方处理）
      console.log('向调用方返回响应数据')
      return res // 由于业务处理有差异，业务成功/失败都交给调用方单独处理
    }
  },
  /**
   * 2.网络请求失败
   * 技术上返回失败，即并不是由后端应用系统返回的错误，而是没能发到服务器或服务器层次返回的标准网络错误，如：500-服务器连接失败
   * 对于这些标准化错误，在这里统一打印日志、显示提示信息，不再往调用方的catch块抛出异常
   */
  error => {
    let message = error.message
    if (error.response) {
      // 请求成功发出且服务器也响应了状态码（并不是由后端应用程序返回的），但状态码非2xx
      const status = error.response.status
      switch (status) {
        case 500:
          message = '服务器内部错误'
          break
      }
      Logger.receive.error(error, message)
    } else if (error.request) {
      // 请求已经成功发起，但没有收到服务器响应
      if (error.code === 'ECONNABORTED') {
        message = '服务器连接超时'
      }
      Logger.send.error(error, message)
    }
    ElMessage.error(message)

    // 这里一定要向调用方抛出异常，调用方可以catch块为空去忽略，因为上面已经统一处理过了
    // 但是如果不写return语句或返回普通值，则是作为调用方的then()函数的输入参数值，可能会干扰then()里正常的业务逻辑
    return Promise.reject(new Error(message))
  }
)

export default service
