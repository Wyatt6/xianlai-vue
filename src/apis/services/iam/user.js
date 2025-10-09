import request from '../../request'

const USER = '/iam/user'

export default {
  register: input => {
    return request({
      desc: '注册新用户',
      method: 'post',
      url: `${USER}/register`,
      data: input
    })
  },
  login: input => {
    return request({
      desc: '用户登录',
      method: 'post',
      url: `${USER}/login`,
      data: input
    })
  },
  logout: () => {
    return request({
      desc: '退出登录',
      url: `${USER}/logout`
    })
  },
  getAuthority: () => {
    return request({
      desc: '获取用户的授权数据',
      url: `${USER}/getAuthority`
    })
  },
  updateAuthority: () => {
    return request({
      desc: '刷新用户的授权数据',
      url: `${USER}/updateAuthority`
    })
  },
  updateBinds: input => {
    return request({
      desc: '更新用户绑定的角色',
      method: 'post',
      url: `${USER}/updateBinds`,
      data: input
    })
  },
  getUsersByPage: (num, size, conditon) => {
    return request({
      desc: '（条件）查询用户分页',
      method: 'post',
      url: `${USER}/getUsersByPage?pageNum=${num}&pageSize=${size}`,
      data: conditon
    })
  },
  freeze: id => {
    return request({
      desc: '冻结用户',
      url: `${USER}/freeze?userId=${id}`
    })
  },
  unfreeze: id => {
    return request({
      desc: '解冻用户',
      url: `${USER}/unfreeze?userId=${id}`
    })
  }
}
