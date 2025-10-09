import Routes from '@/router/routes'

export default [
  {
    path: Routes.INDEX,
    redirect: Routes.INDEX_REDIRECT,
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: Routes.HOMEPAGE,
        name: 'homepage',
        component: () => import('@/views/homepage/index.vue'),
        meta: {
          isMenu: true,
          isBreadcrumb: true,
          title: '首页',
          icon: 'ri-home-4-fill'
        }
      }
    ]
  }
]
