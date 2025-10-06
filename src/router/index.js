/**
 * 路由定义方法：
 * {
 *   path: '/xxx/xxx',
 *   redirect: '/xxx/xxx',
 *   name: 'route name',
 *   component: () => import('@/xxx/xxx/xxx.vue'),
 *   meta: {
 *     login: false,
 *     permission: 'permission identifier',
 *     menu: true,
 *     icon: 'icon display to menu',
 *     label: 'label display to menu'
 *   },
 *   children: []
 * }
 */

import { createRouter, createWebHistory } from 'vue-router'
import Logger from '@/utils/logger'
import { notEmpty } from '@/utils/common'
import Token from '@/utils/token'
import { ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores/system'

const routeTable = [
  {
    path: '/portal',
    redirect: '/portal/login',
    name: 'portal',
    component: () => import('@/views/portal/index.vue'),
    children: [
      {
        path: '/portal/login',
        name: 'login',
        component: () => import('@/views/portal/login/index.vue')
      },
      {
        path: '/portal/register',
        name: 'register',
        component: () => import('@/views/portal/register/index.vue')
      },
      {
        path: '/portal/reset-password',
        name: 'reset_password',
        component: () => import('@/views/portal/reset_password/index.vue')
      }
    ]
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/portal/register/index.vue')
  },
  // 不匹配时（即页面不存在）的路由，须放在最后
  {
    path: '/:catchAll(.*)',
    redirect: '/404',
    name: 'final_not_match'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeTable
})

/**
 * 路由前置守卫：每次路由切换时先执行的操作
 * @param {*} to   要到哪里去
 * @param {*} from 从哪里来
 * @param {*} next 是否要去？
 */
router.beforeEach(async (to, from, next) => {
  Logger.log('路由前置守卫程序 ' + from.path + ' ---> ' + to.path, '')
  if (notEmpty(to.meta) && to.meta.login) {
    // 分支1
    Logger.log('访问须要先登录才能访问的路由')
    if (Token.hasToken() && !Token.isExpired()) {
      Logger.log('用户已登录，token未过期')
      // TODO 判断用户是否有权限访问
      next()
    } else {
      Logger.log('用户未登录或登录已过期，重定向到登录页面')
      if (!Token.hasToken()) {
        ElMessage.error('用户未登录')
      } else {
        ElMessage.error('登录已过期，请重新登录')
      }
      await useSystemStore().resetStoreAndStorage()
      next('/portal/login')
    }
  } else {
    // 分支2
    Logger.log('访问不需要登录即可访问的路由')
    if (
      (to.path === '/portal' || to.path === '/portal/login' || to.path === '/portal/register' || to.path === '/portal/reset-password') &&
      Token.hasToken() &&
      !Token.isExpired()
    ) {
      Logger.log('用户已登录，不允许访问门户页面，重定向到主页')
      next('/')
    } else {
      Logger.log('其他非门户的白名单页面不论登录与否均可访问')
      next()
    }
  }
})

export default router
