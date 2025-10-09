import { createRouter, createWebHistory } from 'vue-router'
import Routes from './routes'
import { noLoginRequired, noPermissionRequired } from './white_list'
import Token from '@/utils/token'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthorityStore } from '@/stores/authority'
import routeTable from './routeTable'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeTable
})

/**
 * 检查用户是否有权限访问该页面URL
 * @param {*} permissions 用户的权限列表
 * @param {*} routeName   要访问的页面名称
 * @returns
 */
function checkRouteAccessPermission(routeName) {
  console.log('检查用户是否有权限访问该页面URL')
  let result = false
  useAuthorityStore().authority.permissions.forEach(item => {
    if (routeName === item) {
      result = true
    }
  })
  return result
}

/**
 * 路由前置守卫：每次路由切换时先执行的操作
 * @param {*} to   要到哪里去
 * @param {*} from 从哪里来
 * @param {*} next 是否要去？
 */
router.beforeEach((to, from, next) => {
  console.groupCollapsed('路由前置守卫程序 ' + from.path + ' ---> ' + to.path)
  if (noLoginRequired.indexOf(to.path) > -1) {
    // ----- 1、访问白名单路径（不需要登录即可访问的路径） -----
    console.log('访问白名单页面')
    if ((to.path === Routes.PORTAL || to.path === Routes.LOGIN || to.path === Routes.REGISTER) && Token.hasToken() && !Token.isExpired()) {
      console.log('用户已登录，不允许访问登录和注册页面，重定向到主页')
      console.groupEnd()
      next(Routes.INDEX)
    } else {
      // 其他的白名单页面不论登录与否均可访问
      console.groupEnd()
      next()
    }
  } else {
    // ----- 2、访问非白名单路径，须先登录，否则重定向到登录页面 -----
    console.log('访问非白名单页面')
    const appStore = useAppStore()
    const authorityStore = useAuthorityStore()
    if (Token.hasToken() && !Token.isExpired()) {
      console.log('用户已登录，token未过期，允许访问页面')
      if (noPermissionRequired.indexOf(to.path) < 0) {
        console.log('访问的页面需要检查用户权限')
        if (!authorityStore.exist || !checkRouteAccessPermission(to.name)) {
          console.log('用户无权限访问页面，跳转到401页面')
          console.groupEnd()
          next(Routes.NOT_AUTHORIZED_EMBEDDED)
          return
        }
        console.log('用户具备访问页面的权限')
      }
      // 访问的页面不需要检查用户权限
      console.groupEnd()
      next()
    } else {
      console.log('用户token不存在或已过期，重定向到登录页面')
      if (!Token.hasToken()) {
        ElMessage.error('用户未登录')
      } else {
        ElMessage.error('登录已过期，请重新登录')
      }
      appStore.initialize()
      console.groupEnd()
      next(Routes.LOGIN)
    }
  }
})

export default router
