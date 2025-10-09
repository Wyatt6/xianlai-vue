import request from '../../request'

const JOURNAL = '/ledger/journal'

export default {
  addJournal: input => {
    return request({
      desc: '新增记账流水',
      method: 'post',
      url: `${JOURNAL}/addJournal`,
      data: input
    })
  },
  deleteJournal: id => {
    return request({
      desc: '删除记账流水',
      url: `${JOURNAL}/deleteJournal?journalId=${id}`
    })
  },
  editJournal: input => {
    return request({
      desc: '编辑记账流水',
      method: 'post',
      url: `${JOURNAL}/editJournal`,
      data: input
    })
  },
  getJournalsByPageConditionally: condition => {
    return request({
      desc: '条件查询记账流水分页数据',
      method: 'post',
      url: `${JOURNAL}/getJournalsByPageConditionally`,
      data: condition
    })
  },
  getSumConditionally: condition => {
    return request({
      desc: '条件查询总收入和总支出',
      method: 'post',
      url: `${JOURNAL}/getSumConditionally`,
      data: condition
    })
  }
}
