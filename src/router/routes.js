/**
 * 页面URL注册表
 */
export default {
  PORTAL: '/portal',
  LOGIN: '/portal/login',
  REGISTER: '/portal/register',

  INDEX: '/',
  INDEX_REDIRECT: '/homepage',
  HOMEPAGE: '/homepage',

  LEDGER: '/ledger',
  LEDGER_REDIRECT: '/ledger/detail',
  LEDGER_DASHBOARD: '/ledger/dashboard',
  LEDGER_DETAIL: '/ledger/detail',
  LEDGER_BUDGET: '/ledger/budget',
  LEDGER_ASSETS: '/ledger/assets',
  LEDGER_SETTINGS: '/ledger/settings',

  IAM: '/iam',
  IAM_REDIRECT: '/iam/user-manage',
  IAM_USER_MANAGE: '/iam/user-manage',
  IAM_ROLE_MANAGE: '/iam/role-manage',
  IAM_PERMISSION_MANAGE: '/iam/permission-manage',

  NOT_AUTHORIZED: '/401',
  NOT_AUTHORIZED_EMBEDDED: '/401/embedded',
  NOT_FOUND: '/404',
  NOT_CONNECTED: '/500'
}
