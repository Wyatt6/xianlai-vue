import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { notEmpty, hasText } from '@/utils/common'
import { useSysOptionStore } from './sys_option'

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
              if (notEmpty(result.data.options) && hasText(result.data.checksum.sysOptionsChecksum)) {
                await useSysOptionStore().evalData(result.data.options, result.data.checksum.sysOptionsChecksum)
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

    if (app != null) app.mount('#app')
  }

  return {
    initData,
    initialize
  }
})
