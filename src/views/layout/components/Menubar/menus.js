import Routes from '@/router/routes'

export default [
  {
    icon: 'ri-home-4-fill',
    title: '首页',
    path: Routes.HOMEPAGE
  },
  {
    icon: 'ri-group-fill',
    title: '身份认证管理',
    path: Routes.IAM,
    children: [
      {
        icon: 'ri-user-settings-fill',
        title: '用户管理',
        path: Routes.IAM_USER_MANAGE
      },
      {
        icon: 'ri-account-box-fill',
        title: '角色管理',
        path: Routes.IAM_ROLE_MANAGE
      },
      {
        icon: 'ri-shield-keyhole-fill',
        title: '权限管理',
        path: Routes.IAM_PERMISSION_MANAGE
      }
    ]
  }
]
