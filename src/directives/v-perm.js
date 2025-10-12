import Storage from '@/utils/storage'

export function validPermissionOr(el, binding) {
  // 指令绑定的权限名数组
  const permissionNames = binding.value
  // 用户所绑定的权限列表
  const permissions = Storage.get(Storage.keys.PERMISSIONS)

  // 要求绑定值是数组形式
  if (permissionNames && permissionNames instanceof Array) {
    let valid = false
    for (var i = 0; i < permissionNames.length; i++) {
      if (permissions.includes(permissionNames[i])) {
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

export function validPermissionAnd(el, binding) {
  // 指令绑定的权限名数组
  const permissionNames = binding.value
  // 用户所绑定的权限列表
  const permissions = Storage.get(Storage.keys.PERMISSIONS)

  // 要求绑定值是数组形式
  if (permissionNames && permissionNames instanceof Array) {
    let valid = true
    for (var i = 0; i < permissionNames.length; i++) {
      if (!permissions.includes(permissionNames[i])) {
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
