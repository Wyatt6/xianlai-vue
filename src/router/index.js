import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePathStore } from '@/stores/path'
import { notEmpty, hasText } from '@/utils/common'
import Logger from '@/utils/logger'
import Token from '@/utils/token'
import { useAppStore } from '@/stores/app'
import { useAuthorityStore } from '@/stores/authority'

const viewComponents = import.meta.glob('@/views/**/*.vue')

export const useRouterStore = defineStore('router', () => {
  const routes = ref([])
  const checksum = ref(null)
  const router = ref(null)

  function dfsRoute(nowRoute) {
    if (hasText(nowRoute.pathName)) {
      nowRoute.path = usePathStore().data[nowRoute.pathName]
    }
    if (hasText(nowRoute.redirectPathName)) {
      nowRoute.redirect = usePathStore().data[nowRoute.redirectPathName]
    }
    if (hasText(nowRoute.componentPath)) {
      nowRoute.component = viewComponents[`/src/views/${nowRoute.componentPath}`]
    }
    nowRoute.meta = {
      needLogin: nowRoute.needLogin,
      needPermission: nowRoute.needPermission,
      permission: nowRoute.permission
    }
    if (notEmpty(nowRoute.children)) {
      nowRoute.children.forEach(item => {
        dfsRoute(item)
      })
    }
  }

  /**
   * 系统路由赋值函数
   */
  async function evalData(routeData, checksumData) {
    checksum.value = checksumData
    if (notEmpty(routeData)) {
      routeData.forEach(item => {
        dfsRoute(item)
      })
      routes.value = routeData
    }
  }

  /**
   * 获取router实例
   */
  function getRouter() {
    if (notEmpty(router.value)) {
      return router.value
    } else {
      router.value = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: routes.value
      })
      /**
       * 路由前置守卫：每次路由切换时先执行的操作
       * @param {*} to   要到哪里去
       * @param {*} from 从哪里来
       * @param {*} next 是否要去？
       */
      router.value.beforeEach((to, from, next) => {
        Logger.log('路由前置守卫程序 ' + from.path + ' ---> ' + to.path, '')
        const Path = usePathStore()
        if (to.meta.needLogin) {
          // 分支1: 访问非白名单路径，须先登录，否则重定向到登录页面
          Logger.log('访问非白名单页面')
          const appStore = useAppStore()
          const authorityStore = useAuthorityStore()
          if (Token.hasToken() && !Token.isExpired()) {
            Logger.log('用户已登录，token未过期')
            // TODO
            if (to.meta.needPermission && !canAccessRoute(to.meta.permission)) {
              Logger.log('用户无权限访问此非白名单页面，跳转到401页面')
              next(Path.data.NOT_AUTHORIZED_EMBEDDED)
              return
            }
            Logger.log('用户允许访问该非白名单页面')
            next()
          } else {
            Logger.log('用户token不存在或已过期，重定向到登录页面')
            if (!Token.hasToken()) {
              ElMessage.error('用户未登录')
            } else {
              ElMessage.error('登录已过期，请重新登录')
            }
            appStore.initialize()
            next(Path.data.LOGIN)
          }
        } else {
          // 分支2: 访问白名单路径（不需要登录即可访问）
          Logger.log('访问白名单页面')
          if (
            (to.path === Path.data.PORTAL || to.path === Path.data.LOGIN || to.path === Path.data.REGISTER || to.path === Path.data.RESET_PASSWORD) &&
            Token.hasToken() &&
            !Token.isExpired()
          ) {
            Logger.log('用户已登录，不允许访问门户页面，重定向到主页')
            next(Path.data.INDEX)
          } else {
            // 其他非门户的白名单页面不论登录与否均可访问
            next()
          }
        }
      })
      return router.value
    }
  }

  return {
    routes,
    checksum,
    evalData,
    getRouter
  }
})

// /**
//  * 检查用户是否有权限访问该页面URL
//  * @param {*} permissions 用户的权限列表
//  * @param {*} routeName   要访问的页面名称
//  * @returns
//  */
// function checkRouteAccessPermission(routeName) {
//   console.log('检查用户是否有权限访问该页面URL')
//   let result = false
//   useAuthorityStore().authority.permissions.forEach(item => {
//     if (routeName === item) {
//       result = true
//     }
//   })
//   return result
// }
