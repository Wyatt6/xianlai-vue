/**
 * apis模块总出口
 * 输出所有后端API请求服务的调用函数
 */

import CommonCaptcha from './services/common/captcha'

import IamUser from './services/iam/user'
import IamRole from './services/iam/role'
import IamPermission from './services/iam/permission'

import LedgerJournal from './services/ledger/journal'
import LedgerCategory from './services/ledger/category'
import LedgerAccount from './services/ledger/account'

export default {
  common: {
    captcha: CommonCaptcha
  },
  iam: {
    user: IamUser,
    role: IamRole,
    permission: IamPermission
  },
  ledger: {
    journal: LedgerJournal,
    category: LedgerCategory,
    account: LedgerAccount
  }
}
