import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { notEmpty, hasText } from '@/utils/common'
import { useOptionStore } from './option'
import { useApiStore } from '@/apis'

export const useSystemStore = defineStore('system', () => {
  const initing = ref(false)
  const data = ref({})
  const checksum = ref({})

  function initFail() {
    document.getElementById('init').style.display = 'none'
    document.getElementById('initFail').style.display = 'flex'
  }

  function checkChecksum(oldChecksum, newChecksum) {
    const newKeys = Object.keys(newChecksum)
    for (let i = 0; i < newKeys.length; i++) {
      const k = newKeys[i]
      if (!hasText(oldChecksum[k]) || oldChecksum[k] !== newChecksum[k]) {
        return false
      }
    }
    const oldKeys = Object.keys(oldChecksum)
    for (let i = 0; i < oldKeys.length; i++) {
      const k = oldKeys[i]
      if (!hasText(newChecksum[k]) || newChecksum[k] !== oldChecksum[k]) {
        return false
      }
    }
    return true
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
            if (notEmpty(result.checksum) && notEmpty(result.data)) {
              data.value = result.data
              checksum.value = result.checksum
              if (hasText(result.checksum.options) && notEmpty(result.data.options)) {
                await useOptionStore().evalData(result.checksum.options, result.data.options)
              }
            }
          } else {
            initFail()
            console.log('获取初始数据失败')
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

    if (app != null) app.mount('#app')
  }

  async function resetStoreAndStorage() {}

  return {
    data,
    checksum,
    initialize,
    resetStoreAndStorage,
    checkChecksum
  }
})
