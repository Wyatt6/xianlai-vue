import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { notEmpty, hasText } from '@/utils/common'
import Logger from '@/utils/logger'
import Storage from '@/utils/storage'
import { useApiStore } from '@/apis'
import { useSysOptionStore } from './sys_option'
import { useSysPathStore } from './sys_path'
import { useAuthorityStore } from './authority'
import { useLayoutStore } from './layout'

export const useSystemStore = defineStore('system', () => {
  const initing = ref(false)
  const initData = ref({})

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
              // 系统参数
              if (notEmpty(result.data.options) && hasText(result.data.checksum.sysOptionsChecksum)) {
                await useSysOptionStore().evalData(result.data.options, result.data.checksum.sysOptionsChecksum)
              }
              // 系统路径
              if (notEmpty(result.data.paths) && hasText(result.data.checksum.sysPathsChecksum)) {
                await useSysPathStore().evalData(result.data.paths, result.data.checksum.sysPathsChecksum)
              // 系统菜单
              if (notEmpty(result.data.menus) && hasText(result.data.checksum.sysMenusChecksum)) {
                await useMenuStore().evalData(result.data.menus, result.data.checksum.sysMenusChecksum)
              }
              // 系统接口
              if (notEmpty(result.data.apis) && hasText(result.data.checksum.sysApisChecksum)) {
                await useApiStore().evalData(result.data.apis, result.data.checksum.sysApisChecksum)
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

    // 加载接口对象
    useApiStore().evalData()

    Logger.log('系统初始化完成')
    if (app != null) app.mount('#app')
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

  function $reset() {
    // 锁是不应该被重置的
  }

  async function resetStoreAndStorage() {
    $reset()
    useAuthorityStore().$reset()
    useLayoutStore().$reset()

    const username = Storage.get(Storage.keys.REMEMBER_USERNAME)
    Storage.clear()
    if (username != null) Storage.set(Storage.keys.REMEMBER_USERNAME, username)
  }

  return {
    initData,
    initialize,
    resetStoreAndStorage,
    isChecksumChange
  }
})
