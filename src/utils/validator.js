const usernameValidator = () => {
  return (rule, value, callback) => {
    const regexp = /^[a-zA-Z_0-9]{3,16}$/
    if (!regexp.test(value)) {
      callback(new Error('仅限大写、小写字母，数字，下划线（_）'))
    } else {
      callback()
    }
  }
}

const passwordValidator = () => {
  return (rule, value, callback) => {
    const regexp = /^[a-zA-Z_0-9.~!@#$%^&*?]{6,16}$/
    if (!regexp.test(value)) {
      callback(new Error('仅限大写、小写字母，数字，特殊字符（_.~!@#$%^&*?）'))
    } else {
      callback()
    }
  }
}

const phoneValidator = () => {
  return (rule, value, callback) => {
    const regexp = /^[1-9][0-9]{10}$/
    if (value.length > 0 && !regexp.test(value)) {
      callback(new Error('手机号码格式不正确'))
    } else {
      callback()
    }
  }
}

const emailValidator = () => {
  return (rule, value, callback) => {
    const regexp = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (value.length > 0 && !regexp.test(value)) {
      callback(new Error('电子邮箱格式不正确'))
    } else {
      callback()
    }
  }
}

const captchaValidator = () => {
  return (rule, value, callback) => {
    const regexp = /^[a-zA-Z0-9]{5}$/
    if (!regexp.test(value)) {
      callback(new Error('验证码格式不正确'))
    } else {
      callback()
    }
  }
}

export default {
  username: usernameValidator,
  password: passwordValidator,
  phone: phoneValidator,
  email: emailValidator,
  captcha: captchaValidator
}
