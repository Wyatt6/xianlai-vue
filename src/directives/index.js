// 官方文档：https://cn.vuejs.org/guide/reusability/custom-directives.html#introduction
import { validRoleOr, validRoleAnd } from './v-role'
import { validPermissionOr, validPermissionAnd } from './v-perm'

// 自定义指令注册函数，接受一个Vue应用实例作为参数
export default app => {
  // 注册指令v-role（OR模式）
  app.directive('role', (el, binding) => {
    validRoleOr(el, binding) // 简化形式，等价于在mounted和update两个钩子实现相同的行为，其他钩子不定义
  })
  // 注册指令v-roleAnd
  app.directive('roleAnd', (el, binding) => {
    validRoleAnd(el, binding)
  })

  // 注册指令v-perm（OR模式）
  app.directive('perm', (el, binding) => {
    validPermissionOr(el, binding)
  })
  // 注册指令v-permAnd
  app.directive('permAnd', (el, binding) => {
    validPermissionAnd(el, binding)
  })
}
