import Routes from '@/router/routes'

export default [
  {
    path: Routes.INDEX,
    redirect: Routes.INDEX_REDIRECT,
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: Routes.IAM,
        redirect: Routes.IAM_REDIRECT,
        name: 'menu:iam',
        component: () => component('@/views/layout/components/Placeholder/index.vue'),
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
            component: () => component('@/views/iam/UserManage/index.vue'),
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
            component: () => component('@/views/iam/RoleManage/index.vue'),
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
            component: () => component('@/views/iam/PermissionManage/index.vue'),
            meta: {
              isMenu: true,
              isBreadcrumb: true,
              title: '权限管理',
              icon: 'ri-shield-keyhole-fill'
            }
          }
        ]
      }
    ]
  }
]
