import request from '../../request'

const ROLE = '/iam/role'

export default {
  addRole: input => {
    return request({
      desc: '新增角色',
      method: 'post',
      url: `${ROLE}/add`,
      data: input
    })
  },
  deleteRole: id => {
    return request({
      desc: '删除角色',
      url: `${ROLE}/delete?roleId=${id}`
    })
  },
  editRole: input => {
    return request({
      desc: '修改角色',
      method: 'post',
      url: `${ROLE}/edit`,
      data: input
    })
  },
  updateGrants: input => {
    return request({
      desc: '更新角色的授权',
      method: 'post',
      url: `${ROLE}/updateGrants`,
      data: input
    })
  },
  swapPosition: (id1, id2) => {
    return request({
      desc: '交换位置',
      url: `${ROLE}/swapPosition?id1=${id1}&id2=${id2}`
    })
  },
  getRolesByPage: (pageNum, pageSize, condition) => {
    return request({
      desc: '（条件）查询角色分页',
      method: 'post',
      url: `${ROLE}/getRolesByPage?pageNum=${pageNum}&pageSize=${pageSize}`,
      data: condition
    })
  },
  getRowNumStartFrom1: id => {
    return request({
      desc: '查询角色的排名（从1开始）',
      url: `${ROLE}/getRowNumStartFrom1?roleId=${id}`
    })
  },
  getRoles: () => {
    return request({
      desc: '查询全量角色列表',
      url: `${ROLE}/getRoles`
    })
  },
  getRoleIdsOfUser: id => {
    return request({
      desc: '查询某用户所具有的角色ID列表',
      url: `${ROLE}/getRoleIdsOfUser?userId=${id}`
    })
  }
}
