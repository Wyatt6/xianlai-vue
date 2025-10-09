import request from '../../request'

const ACCOUNT = '/ledger/account'

export default {
  addAccount: input => {
    return request({
      desc: '添加动账账户',
      method: 'post',
      url: `${ACCOUNT}/addAccount`,
      data: input
    })
  },
  editAccount: input => {
    return request({
      desc: '编辑动账账户',
      method: 'post',
      url: `${ACCOUNT}/editAccount`,
      data: input
    })
  },
  swapPosition: (id1, id2) => {
    return request({
      desc: '交换位置',
      url: `${ACCOUNT}/swapPosition?id1=${id1}&id2=${id2}`
    })
  },
  deleteAccount: id => {
    return request({
      desc: '删除动账账户',
      url: `${ACCOUNT}/deleteAccount?accountId=${id}`
    })
  },
  getAccounts: () => {
    return request({
      desc: '获取动账账户列表',
      url: `${ACCOUNT}/getAccounts`
    })
  }
}
