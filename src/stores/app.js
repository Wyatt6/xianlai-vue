import { defineStore } from 'pinia'
import { ref } from 'vue'
import Storage from '@/utils/storage'
import { useAuthorityStore } from './authority'
import { useLayoutStore } from './layout'

export const useAppStore = defineStore('app', () => {
  const logoutLock = ref(false)

  /**
   * 退出登陆锁处理
   */
  function setLogoutLock() {
    logoutLock.value = true
  }
  function releaseLogoutLock() {
    logoutLock.value = false
  }

  /**
   * 重置函数
   */
  function $reset() {
    console.log('重置appStore状态值')
    // 锁是不应该被重置的
  }

  /**
   * 前端应用初始化
   */
  async function initialize() {
    console.groupCollapsed('前端应用初始化')

    $reset()
    useAuthorityStore().$reset()
    useLayoutStore().$reset()

    console.log('清理浏览器无用的缓存值')
    const username = Storage.get(Storage.keys.REMEMBER_USERNAME)
    Storage.clear()
    if (username != null) Storage.set(Storage.keys.REMEMBER_USERNAME, username)

    console.groupEnd()
  }

  return {
    logoutLock,
    setLogoutLock,
    releaseLogoutLock,
    initialize
  }
})
