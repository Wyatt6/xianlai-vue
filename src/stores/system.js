import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { notEmpty, hasText } from '@/utils/common'
import Logger from '@/utils/logger'
import { useApiStore } from '@/apis'
import { useRouterStore } from '@/router'
import { useOptionStore } from './option'
import { usePathStore } from './path'
import { useMenuStore } from './menu'

export const useSystemStore = defineStore('system', () => {
  const initing = ref(false)
  const initData = ref({})
  const logoutLock = ref(false)

  function setLogoutLock() {
    logoutLock.value = true
  }
  function releaseLogoutLock() {
    logoutLock.value = false
  }

  function initFail() {
    document.getElementById('init').style.display = 'none'
    document.getElementById('initFail').style.display = 'flex'
  }

  async function initialize(app) {
    // 获取初始化数据
    if (!initing.value) {
      initing.value = true
      await axios
        .get('/api/common/init/getInitData', {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          timeout: 60000
        })
        .then(async response => {
          const result = response.data
          if (result.success) {
            if (notEmpty(result.data) && notEmpty(result.data.checksum)) {
              initData.value = result.data
              // 清除旧的路由实例
              await useRouterStore().clearRouter()
              // 系统参数
              if (notEmpty(result.data.options) && hasText(result.data.checksum.sysOptionsChecksum)) {
                await useOptionStore().evalData(result.data.options, result.data.checksum.sysOptionsChecksum)
                Logger.log('系统参数初始化完成')
              }
              // 系统路径
              if (notEmpty(result.data.paths) && hasText(result.data.checksum.sysPathsChecksum)) {
                await usePathStore().evalData(result.data.paths, result.data.checksum.sysPathsChecksum)
                Logger.log('系统路径初始化完成')
              }
              // 系统路由
              if (notEmpty(result.data.routes) && hasText(result.data.checksum.sysRoutesChecksum)) {
                await useRouterStore().evalData(result.data.routes, result.data.checksum.sysRoutesChecksum)
                Logger.log('系统路由初始化完成')
              }
              // 系统菜单
              if (notEmpty(result.data.menus) && hasText(result.data.checksum.sysMenusChecksum)) {
                await useMenuStore().evalData(result.data.menus, result.data.checksum.sysMenusChecksum)
                Logger.log('系统菜单初始化完成')
              }
              // 注册router插件
              if (app != null) {
                app.use(useRouterStore().getRouter())
              }
              // 系统接口
              if (notEmpty(result.data.apis) && hasText(result.data.checksum.sysApisChecksum)) {
                await useApiStore().evalData(result.data.apis, result.data.checksum.sysApisChecksum)
                Logger.log('系统接口初始化完成')
              }
            }
          } else {
            initFail()
            console.error('获取初始数据失败')
          }
        })
        .catch(error => {
          initFail()
          console.error(error)
        })
        .finally(() => {
          initing.value = false
        })
    }
    Logger.log('系统初始化完成')
    if (app != null) {
      app.mount('#app')
    }
  }

  function getChecksums() {
    return initData.value.checksum
  }

  function isChecksumChange(newChecksum) {
    const oldChecksum = getChecksums()
    const newKeys = Object.keys(newChecksum)
    for (let i = 0; i < newKeys.length; i++) {
      const k = newKeys[i]
      if (!hasText(oldChecksum[k]) || oldChecksum[k] !== newChecksum[k]) {
        return true
      }
    }
    const oldKeys = Object.keys(oldChecksum)
    for (let i = 0; i < oldKeys.length; i++) {
      const k = oldKeys[i]
      if (!hasText(newChecksum[k]) || newChecksum[k] !== oldChecksum[k]) {
        return true
      }
    }
    return false
  }

  return {
    initData,
    setLogoutLock,
    releaseLogoutLock,
    initialize,
    isChecksumChange
  }
})
