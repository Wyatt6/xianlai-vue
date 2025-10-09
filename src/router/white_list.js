import Routes from './routes'

/**
 * 不需要登录即可访问的页面路由
 */
export const noLoginRequired = [
  Routes.PORTAL,
  Routes.LOGIN,
  Routes.REGISTER,
  Routes.NOT_AUTHORIZED,
  Routes.NOT_FOUND,
  Routes.NOT_CONNECTED
]

/**
 * 需要登陆，但登陆后不需要具备权限即可访问的页面路由
 */
export const noPermissionRequired = [
  ...noLoginRequired,
  Routes.INDEX,
  Routes.INDEX_REDIRECT,
  Routes.HOMEPAGE,
  Routes.NOT_AUTHORIZED_EMBEDDED
]
