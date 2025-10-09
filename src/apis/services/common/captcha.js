import request from '../../request'

const CAPTCHA = '/common/captcha'

export default {
  getCaptcha: () => {
    return request({
      desc: '获取验证码',
      url: `${CAPTCHA}/getCaptcha`
    })
  }
}
