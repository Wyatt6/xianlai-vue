import { useOptionStore } from '@/stores/option'

/**
 * 请求发送日志
 * @param {*} request 请求对象
 */
function sendInfo(request) {
  if (useOptionStore().data.console.openLog) {
    let baseUrl = request.baseURL
    if (baseUrl != null && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1)
    }
    let pathUrl = request.url
    if (pathUrl[0] === '/') {
      pathUrl = pathUrl.slice(1, pathUrl.length)
    }
    const url = baseUrl + '/' + pathUrl
    console.groupCollapsed('%cRequest: [' + request.method.toUpperCase() + '] ' + url + ' ' + request.desc, 'color:black')
    console.groupEnd()
  }
}

/**
 * 请求发送异常日志
 * @param {*} error     异常对象
 * @param {*} message   异常信息
 */
function sendError(error, message) {
  if (useOptionStore().data.console.openLog) {
    let baseUrl = error.config.baseURL
    if (baseUrl != null && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1)
    }
    let pathUrl = error.config.url
    if (pathUrl[0] === '/') {
      pathUrl = pathUrl.slice(1, pathUrl.length)
    }
    const url = baseUrl + '/' + pathUrl
    console.groupCollapsed('%cERROR Request: [' + error.config.method.toUpperCase() + '] ' + url + ' ' + error.config.desc, 'color:red')
    if (message != null) {
      console.log('message:', message)
    }
    if (error != null) {
      console.log('error:', error)
    }
    console.groupEnd()
  }
}

/**
 * 响应接收日志
 * @param {*} request   请求对象
 * @param {*} response  响应对象
 */
function receiveInfo(request, response) {
  if (useOptionStore().data.console.openLog) {
    let baseUrl = request.baseURL
    if (baseUrl != null && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1)
    }
    let pathUrl = request.url
    if (pathUrl[0] === '/') {
      pathUrl = pathUrl.slice(1, pathUrl.length)
    }
    const url = baseUrl + '/' + pathUrl
    console.groupCollapsed('%cResponse: ' + url, 'color:green')
    if (response && response.traceId != null) {
      console.log('traceId:', response.traceId)
    }
    if (response && response.success != null) {
      console.log('success:', response.success)
    }
    if (response && response.data != null && JSON.stringify(response.data) !== '{}') {
      console.log('data:', response.data)
    }
    console.groupEnd()
  }
}

/**
 * 响应接收异常日志
 * @param {*} error     异常对象
 * @param {*} message   异常信息
 */
function receiveError(error, message) {
  if (useOptionStore().data.console.openLog) {
    let baseUrl = error.config.baseURL
    if (baseUrl != null && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1)
    }
    let pathUrl = error.config.url
    if (pathUrl[0] === '/') {
      pathUrl = pathUrl.slice(1, pathUrl.length)
    }
    const url = baseUrl + '/' + pathUrl
    console.groupCollapsed('%cERROR Response: [' + error.response.status + '] ' + url, 'color:red')
    if (message != null) {
      console.log('message:', message)
    }
    if (error != null) {
      console.log('error:', error)
    }
    console.groupEnd()
  }
}

export default {
  // 请求发送的两种情况，发送成功用info打印日志，发送失败用error打印日志
  send: {
    info: sendInfo,
    error: sendError
  },
  // 请求接收的两种情况，接收成功用info打印日志，接收失败用error打印日志
  receive: {
    info: receiveInfo,
    error: receiveError
  }
}
