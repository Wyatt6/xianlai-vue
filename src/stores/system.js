import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { notEmpty, hasText } from '@/utils/common'
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
              if (notEmpty(result.data.options) && hasText(result.data.checksum.optionsChecksum)) {
                await useOptionStore().evalData(result.data.options, result.data.checksum.optionsChecksum)
                console.log('参数数据加载完成')
              }
              // 系统路径
              if (notEmpty(result.data.paths) && hasText(result.data.checksum.pathsChecksum)) {
                await usePathStore().evalData(result.data.paths, result.data.checksum.pathsChecksum)
                console.log('路径数据加载完成')
              }
              // 系统路由
              if (notEmpty(result.data.routes) && hasText(result.data.checksum.routesChecksum)) {
                await useRouterStore().evalData(result.data.routes, result.data.checksum.routesChecksum)
                console.log('路由数据加载完成')
              }
              // 系统菜单
              if (notEmpty(result.data.menus) && hasText(result.data.checksum.menusChecksum)) {
                await useMenuStore().evalData(result.data.menus, result.data.checksum.menusChecksum)
                console.log('菜单数据加载完成')
              }
              // 注册router插件
              if (app != null) {
                app.use(useRouterStore().getRouter())
                console.log('router插件注册完成')
              }
              // 系统接口（要用到router插件）
              if (notEmpty(result.data.apis) && hasText(result.data.checksum.apisChecksum)) {
                await useApiStore().evalData(result.data.apis, result.data.checksum.apisChecksum)
                console.log('接口数据加载完成')
              }
              // 挂载页面到Vue应用
              console.log('系统初始化完成')
              if (app != null) {
                app.mount('#app')
                console.log('#app已挂载')
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
