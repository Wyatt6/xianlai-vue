/**
 * 系统菜单使用方法：
 * const Menu = useMenuStore()
 * Menu.data.xxx.xxx
 */

import { notEmpty } from '@/utils/common'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePathStore } from './path'

export const useMenuStore = defineStore('menu', () => {
  const data = ref([])
  const checksum = ref(null)

  function dfsMenu(nowMenu) {
    nowMenu.path = usePathStore().data[nowMenu.pathName]
    if (notEmpty(nowMenu.children)) {
      nowMenu.children.forEach(item => {
        dfsMenu(item)
      })
    }
  }

  /**
   * 系统菜单赋值函数
   */
  async function evalData(menuData, checksumData) {
    checksum.value = checksumData
    if (notEmpty(menuData)) {
      menuData.forEach(item => {
        dfsMenu(item)
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
