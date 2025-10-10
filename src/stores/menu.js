/**
 * 系统菜单使用方法：
 * const Menu = useMenuStore()
 * Menu.data.xxx.xxx
 */

import { notEmpty } from '@/utils/common'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSysPathStore } from './sys_path'

export const useMenuStore = defineStore('sysMenu', () => {
  const data = ref([])
  const checksum = ref(null)

  function dfsPath(nowMenu) {
    nowMenu.path = useSysPathStore().data[nowMenu.pathName]
    if (notEmpty(nowMenu.children)) {
      nowMenu.children.forEach(item => {
        dfsPath(item)
      })
    }
  }

  async function evalData(menuData, checksumData) {
    checksum.value = checksumData
    if (notEmpty(menuData)) {
      menuData.forEach(item => {
        dfsPath(item)
      })
      data.value = menuData
    }
  }

  return {
    data,
    checksum,
    evalData
  }
})
