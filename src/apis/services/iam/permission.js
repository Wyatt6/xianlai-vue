import request from '../../request'

const PERMISSION = '/iam/permission'

export default {
  addPermission: input => {
    return request({
      desc: '新增权限',
      method: 'post',
      url: `${PERMISSION}/add`,
      data: input
    })
  },
  deletePermission: id => {
    return request({
      desc: '删除权限',
      url: `${PERMISSION}/delete?permissionId=${id}`
    })
  },
  editPermission: input => {
    return request({
      desc: '修改权限',
      method: 'post',
      url: `${PERMISSION}/edit`,
      data: input
    })
  },
  getPermissions: () => {
    return request({
      desc: '获取全量权限数据',
      url: `${PERMISSION}/getPermissions`
    })
  },
  getPermissionIdsOfRole: id => {
    return request({
      desc: '查询某角色所具有的权限ID列表',
      url: `${PERMISSION}/getPermissionIdsOfRole?roleId=${id}`
    })
  },
  getPermissionsByPage: (pageNum, pageSize, condition) => {
    return request({
      desc: '（条件）查询权限分页',
      method: 'post',
      url: `${PERMISSION}/getPermissionsByPage?pageNum=${pageNum}&pageSize=${pageSize}`,
      data: condition
    })
  },
  getRowNumStartFrom1: id => {
    return request({
      desc: '查询权限的排名（从1开始）',
      url: `${PERMISSION}/getRowNumStartFrom1?permissionId=${id}`
    })
  }
}
