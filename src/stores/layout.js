import { defineStore } from 'pinia'
import { ref } from 'vue'
import Storage from '@/utils/storage'
import { usePathStore } from './path'

export const useLayoutStore = defineStore('layout', () => {
  const menubarExpand = ref(Storage.get(Storage.keys.MENUBAR_EXPAND) == null ? true : Storage.get(Storage.keys.MENUBAR_EXPAND))
  const tagList = ref(Storage.get(Storage.keys.TAG_LIST) || [])

  /**
   * 切换菜单栏伸缩状态
   */
  function changeMenubarExpand() {
    menubarExpand.value = !menubarExpand.value
    Storage.set(Storage.keys.MENUBAR_EXPAND, menubarExpand.value)
  }

  /**
   * 添加新的页面标签数据到缓存中的页面标签列表中
   */
  function addTag(tag) {
    const isFind = tagList.value.find(item => {
      return item.path === tag.path
    })
    if (!isFind) {
      tagList.value.push(tag)
      Storage.set(Storage.keys.TAG_LIST, tagList.value)
    }
  }

  /**
   * 删除一个或多个标签
   */
  async function removeTags(payload) {
    const mode = payload.mode
    const index = payload.index
    if (mode === 'index') {
      tagList.value.splice(index, 1)
    } else if (mode === 'all') {
      let tagIndex = -1
      for (let i = 0; i < tagList.value.length; i++) {
        if (tagList.value[i].fullPath === usePathStore().data.INDEX) {
          tagIndex = i
          break
        }
      }
      if (tagIndex === -1) {
        tagList.value = []
      } else {
        tagList.value.splice(tagIndex + 1, tagList.value.length - tagIndex + 1)
        tagList.value.splice(0, tagIndex)
      }
    } else if (mode === 'other') {
      tagList.value.splice(index + 1, tagList.value.length - index + 1)
      tagList.value.splice(0, index)
    } else if (mode === 'right') {
      tagList.value.splice(index + 1, tagList.value.length - index + 1)
    }
    Storage.set(Storage.keys.TAG_LIST, tagList.value)
  }

  return {
    menubarExpand,
    changeMenubarExpand,
    tagList,
    addTag,
    removeTags
  }
})
