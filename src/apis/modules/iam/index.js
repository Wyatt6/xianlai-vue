const userApis = [
  {
    description: '注册新用户',
    callPath: 'iam.user.register',
    requestMethod: 'post',
    url: '/api/iam/user/register'
  },
  {
    description: '用户登录',
    callPath: 'iam.user.login',
    requestMethod: 'post',
    url: '/api/iam/user/login'
  }
]

export default [...userApis]
