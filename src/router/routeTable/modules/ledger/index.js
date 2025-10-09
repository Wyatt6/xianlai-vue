import Routes from '@/router/routes'

export default [
  {
    path: Routes.INDEX,
    redirect: Routes.INDEX_REDIRECT,
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: Routes.LEDGER,
        redirect: Routes.LEDGER_REDIRECT,
        name: 'menu:ledger',
        component: () => component('@/views/layout/components/Placeholder/index.vue'),
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
            component: () => component('@/views/ledger/detail/index.vue'),
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
            component: () => component('@/views/ledger/settings/index.vue'),
            meta: {
              isMenu: true,
              isBreadcrumb: true,
              breadcrumbRedirect: true,
              title: '参数设置',
              icon: 'ri-settings-3-fill'
            }
          }
        ]
      }
    ]
  }
]
