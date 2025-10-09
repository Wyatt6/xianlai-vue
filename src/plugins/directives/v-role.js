import { useAuthorityStore } from '@/stores/authority'

export function validRoleOr(el, binding) {
  // 指令绑定的角色名数组
  const roleNames = binding.value
  // 用户所绑定的角色列表
  const roles = useAuthorityStore().authority.roles

  // 要求绑定值是数组形式
  if (roleNames && roleNames instanceof Array) {
    let valid = false
    for (var i = 0; i < roleNames.length; i++) {
      if (roles.includes(roleNames[i])) {
        valid = true
        break
      }
    }
    // 如果不满足要求则不显示该元素
    if (!valid) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('Bound value must be an instance of Array.')
  }
}

export function validRoleAnd(el, binding) {
  // 指令绑定的角色名数组
  const roleNames = binding.value
  // 用户所绑定的角色列表
  const roles = useAuthorityStore().authority.roles

  // 要求绑定值是数组形式
  if (roleNames && roleNames instanceof Array) {
    let valid = true
    for (var i = 0; i < roleNames.length; i++) {
      if (!roles.includes(roleNames[i])) {
        valid = false
        break
      }
    }
    // 如果不满足要求则不显示该元素
    if (!valid) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('Bound value must be an instance of Array.')
  }
}
