import { defineStore } from 'pinia'
import { ref } from 'vue'
import Storage from '@/utils/storage'
import Apis from '@/apis'
import { ElMessage } from 'element-plus'

/**
 * 用户授权数据（包括角色roles和权限permissions）相关的状态和操作
 */
export const useAuthorityStore = defineStore('authority', () => {
  const lock = ref(false) // 资源访问锁
  const exist = ref(!(Storage.get(Storage.keys.AUTHORITY) == null))
  const authority = ref(Storage.get(Storage.keys.AUTHORITY) == null ? {} : Storage.get(Storage.keys.AUTHORITY)) // 刷新网页会重置状态值，所以默认值不能赋为{}

  /**
   * 获取用户授权数据
   */
  async function getAuthority() {
    console.groupCollapsed('获取用户授权数据')
    lock.value = true
    await Apis.iam.user
      .getAuthority()
      .then(res => {
        if (res && res.success) {
          console.log('成功获取用户授权数据')
          const authorityObj = res.data.authority
          Storage.set(Storage.keys.AUTHORITY, authorityObj)
          authority.value = authorityObj
          exist.value = true
        } else {
          console.log('获取用户授权数据失败')
          ElMessage.error(res && res.message ? res.message : '获取用户授权数据失败')
        }
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })
    lock.value = false
    console.groupEnd()
  }

  /**
   * 刷新授权数据
   */
  async function updateAuthority() {
    console.groupCollapsed('刷新用户授权数据')
    lock.value = true
    await Apis.iam.user
      .updateAuthority()
      .then(res => {
        if (res && res.success) {
          console.log('成功刷新用户授权数据')
          const authorityObj = res.data.authority
          Storage.set(Storage.keys.AUTHORITY, authorityObj)
          authority.value = authorityObj
          exist.value = true
          ElMessage.success('成功刷新授权')
        } else {
          console.log('刷新用户授权数据失败')
          ElMessage.error(res && res.message ? res.message : '刷新授权失败')
        }
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })
    lock.value = false
    console.groupEnd()
  }

  function $reset() {
    console.log('重置authorityStore状态值')
    // 锁是不应该被重置的
    exist.value = false
    authority.value = {}
  }

  return {
    lock,
    exist,
    authority,
    getAuthority,
    updateAuthority,
    $reset
  }
})
