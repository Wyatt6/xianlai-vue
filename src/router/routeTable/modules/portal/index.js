/**
 * 路由定义方法：
 * {
 *   path: routes.XXX,
 *   redirect: routes.YYY,
 *   name: 'route name',
 *   component: () => import('@/xxx/xxx/xxx.vue'),
 *   meta: {
 *     login: false,
 *     permission: 'permission identifier'
 *   },
 *   children: []
 * }
 */

import Routes from '@/router/routes'

export default [
  {
    path: Routes.PORTAL,
    redirect: Routes.LOGIN,
    name: 'portal',
    component: () => import('@/views/portal/index.vue'),
    children: [
      {
        path: Routes.LOGIN,
        name: 'login',
        component: () => import('@/views/portal/login/index.vue')
      },
      {
        path: Routes.REGISTER,
        name: 'register',
        component: () => import('@/views/portal/register/index.vue')
      },
      {
        path: Routes.RESET_PASSWORD,
        name: 'reset_password',
        component: () => import('@/views/portal/reset_password/index.vue')
      }
    ]
  }
]
