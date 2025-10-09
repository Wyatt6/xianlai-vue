const initApis = [
  {
    description: '获取初始化数据',
    callPath: 'common.init.getInitData',
    requestMethod: 'get',
    url: '/api/common/init/getInitData'
  }
]

const captchaApis = [
  {
    description: '获取验证码',
    callPath: 'common.captcha.getCaptcha',
    requestMethod: 'get',
    url: '/api/common/captcha/getCaptcha'
  }
]

export default [...initApis, ...captchaApis]
