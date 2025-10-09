import request from '../../request'

const CATEGORY = '/ledger/category'

export default {
  addCategory: input => {
    return request({
      desc: '新增记账类别',
      method: 'post',
      url: `${CATEGORY}/addCategory`,
      data: input
    })
  },
  getCategoryTree: () => {
    return request({
      desc: '获取记账类别树（森林）',
      url: `${CATEGORY}/getCategoryTree`
    })
  },
  getCategories: () => {
    return request({
      desc: '获取所有记账类别列表',
      url: `${CATEGORY}/getCategories`
    })
  },
  changeActivated: (rootId, newActivated) => {
    return request({
      desc: '启用/禁用记账类别子树',
      url: `${CATEGORY}/changeActivated?rootId=${rootId}&newActivated=${newActivated}`
    })
  },
  moveOneRow: (id, mode) => {
    return request({
      desc: '上/下移动目标记账类别一行',
      url: `${CATEGORY}/moveOneRow?id=${id}&mode=${mode}`
    })
  },
  deleteCategoryTree: id => {
    return request({
      desc: '删除记账类别及其子类别',
      url: `${CATEGORY}/deleteCategoryTree?id=${id}`
    })
  },
  editCategory: input => {
    return request({
      desc: '编辑记账类别',
      method: 'post',
      url: `${CATEGORY}/editCategory`,
      data: input
    })
  }
}
