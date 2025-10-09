import { createRouter, createWebHistory } from 'vue-router'
import Routes from './routes'
import { noLoginRequired, noPermissionRequired } from './white_list'
import Token from '@/utils/token'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthorityStore } from '@/stores/authority'

import Portal from '@/views/portal/index.vue'
import Login from '@/views/portal/login/index.vue'
import Register from '@/views/portal/register/index.vue'

import Layout from '@/views/layout/index.vue'
import Placeholder from '@/views/layout/components/Placeholder/index.vue'
import Homepage from '@/views/homepage/index.vue'

import LedgerDetail from '@/views/ledger/detail/index.vue'
import LedgerSettings from '@/views/ledger/settings/index.vue'

import IamUserManage from '@/views/iam/UserManage/index.vue'
import IamRoleManage from '@/views/iam/RoleManage/index.vue'
import IamPermissionManage from '@/views/iam/PermissionManage/index.vue'

import Err401 from '@/views/errors/401.vue'
import Err404 from '@/views/errors/404.vue'
import Err500 from '@/views/errors/500.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: Routes.PORTAL,
      redirect: Routes.LOGIN,
      name: 'portal',
      component: Portal,
      children: [
        {
          path: Routes.LOGIN,
          name: 'login',
          component: Login
        },
        {
          path: Routes.REGISTER,
          name: 'register',
          component: Register
        },
        {
          path: Routes.RESET_PASSWORD,
          name: 'reset_password',
          component: () => import('@/views/portal/reset_password/index.vue')
        }
      ]
    },
    {
      path: Routes.INDEX,
      redirect: Routes.INDEX_REDIRECT,
      name: 'layout',
      component: Layout,
      children: [
        // ----- 侧边栏菜单 -----
        {
          path: Routes.HOMEPAGE,
          name: 'homepage',
          component: Homepage,
          meta: {
            isMenu: true,
            isBreadcrumb: true,
            title: '首页',
            icon: 'ri-home-4-fill'
          }
        },
        // ----- 记账本模块 Ledger -----
        {
          path: Routes.LEDGER,
          redirect: Routes.LEDGER_REDIRECT,
          name: 'menu:ledger',
          component: Placeholder,
          meta: {
            isMenu: true,
            isBreadcrumb: true,
            breadcrumbRedirect: true,
            title: '记账本 Ledger',
            icon: 'ri-money-cny-circle-fill'
          },
          children: [
            // {
            //   path: Routes.LEDGER_DASHBOARD,
            //   name: 'menu_ledger_dashboard',
            //   component: Placeholder,
            //   meta: {
            //     isMenu: true,
            //     isBreadcrumb: true,
            //     breadcrumbRedirect: true,
            //     title: '数据看板',
            //     icon: 'ri-bar-chart-2-fill'
            //   }
            // },
            {
              path: Routes.LEDGER_DETAIL,
              name: 'menu:ledger_detail',
              component: LedgerDetail,
              meta: {
                isMenu: true,
                isBreadcrumb: true,
                breadcrumbRedirect: true,
                title: '记账明细',
                icon: 'ri-file-text-fill'
              }
            },
            // {
            //   path: Routes.LEDGER_BUDGET,
            //   name: 'menu_ledger_budget',
            //   component: Placeholder,
            //   meta: {
            //     isMenu: true,
            //     isBreadcrumb: true,
            //     breadcrumbRedirect: true,
            //     title: '预算管理',
            //     icon: 'ri-shopping-cart-fill'
            //   }
            // },
            // {
            //   path: Routes.LEDGER_ASSETS,
            //   name: 'menu_ledger_assets',
            //   component: Placeholder,
            //   meta: {
            //     isMenu: true,
            //     isBreadcrumb: true,
            //     breadcrumbRedirect: true,
            //     title: '资产盘点',
            //     icon: 'ri-hand-coin-fill'
            //   }
            // },
            {
              path: Routes.LEDGER_SETTINGS,
              name: 'menu:ledger_settings',
              component: LedgerSettings,
              meta: {
                isMenu: true,
                isBreadcrumb: true,
                breadcrumbRedirect: true,
                title: '参数设置',
                icon: 'ri-settings-3-fill'
              }
            }
          ]
        },
        // ----- 身份认证管理模块 IAM -----
        {
          path: Routes.IAM,
          redirect: Routes.IAM_REDIRECT,
          name: 'menu:iam',
          component: Placeholder,
          meta: {
            isMenu: true,
            isBreadcrumb: true,
            breadcrumbRedirect: true,
            title: '身份认证管理 IAM',
            icon: 'ri-group-fill'
          },
          children: [
            {
              path: Routes.IAM_USER_MANAGE,
              name: 'menu:user_manage',
              component: IamUserManage,
              meta: {
                isMenu: true,
                isBreadcrumb: true,
                title: '用户管理',
                icon: 'ri-user-settings-fill'
              }
            },
            {
              path: Routes.IAM_ROLE_MANAGE,
              name: 'menu:role_manage',
              component: IamRoleManage,
              meta: {
                isMenu: true,
                isBreadcrumb: true,
                title: '角色管理',
                icon: 'ri-account-box-fill'
              }
            },
            {
              path: Routes.IAM_PERMISSION_MANAGE,
              name: 'menu:permission_manage',
              component: IamPermissionManage,
              meta: {
                isMenu: true,
                isBreadcrumb: true,
                title: '权限管理',
                icon: 'ri-shield-keyhole-fill'
              }
            }
          ]
        },
        // ----- 错误提示 -----
        {
          path: Routes.NOT_AUTHORIZED_EMBEDDED,
          name: 'notAuthorizedEmbedded',
          component: Err401,
          meta: {
            isBreadcrumb: true,
            breadcrumbRedirect: true,
            title: '访问权限不足'
          }
        }
      ]
    },
    {
      path: Routes.NOT_AUTHORIZED,
      name: 'notAuthorized',
      component: Err401
    },
    {
      path: Routes.NOT_FOUND,
      name: 'notFound',
      component: Err404
    },
    {
      path: Routes.NOT_CONNECTED,
      name: 'notConnect',
      component: Err500
    }
  ]
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
