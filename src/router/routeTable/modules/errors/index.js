import Routes from '@/router/routes'

export default [
  {
    path: Routes.INDEX,
    redirect: Routes.INDEX_REDIRECT,
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: Routes.NOT_AUTHORIZED_EMBEDDED,
        name: 'notAuthorizedEmbedded',
        component: () => import('@/views/errors/401.vue'),
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
    component: () => import('@/views/errors/401.vue')
  },
  {
    path: Routes.NOT_FOUND,
    name: 'notFound',
    component: () => import('@/views/errors/404.vue')
  },
  {
    path: Routes.NOT_CONNECTED,
    name: 'notConnect',
    component: () => import('@/views/errors/500.vue')
  }
]
