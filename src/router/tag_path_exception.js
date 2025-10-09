import Routes from './routes'

// 不显示为标签页的页面URL
export const tagPathException = [
  Routes.PORTAL,
  Routes.LOGIN,
  Routes.REGISTER,
  Routes.RESET_PASSWORD,
  Routes.NOT_AUTHORIZED,
  Routes.NOT_FOUND,
  Routes.NOT_CONNECTED
]
