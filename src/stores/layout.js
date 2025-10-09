import { defineStore } from 'pinia'
import { ref } from 'vue'
import Storage from '@/utils/storage'
import Routes from '@/router/routes'

export const useLayoutStore = defineStore('layout', () => {
  const sidebarExpand = ref(Storage.get(Storage.keys.SIDEBAR_EXPAND) == null ? true : Storage.get(Storage.keys.SIDEBAR_EXPAND))
  const tagList = ref(Storage.get(Storage.keys.TAG_LIST) || [])

  /**
   * 切换菜单栏伸缩状态
   */
  function changeSidebarExpand() {
    sidebarExpand.value = !sidebarExpand.value
    Storage.set(Storage.keys.SIDEBAR_EXPAND, sidebarExpand.value)
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
        if (tagList.value[i].fullPath === Routes.INDEX) {
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

  /**
   * 重置函数
   */
  function $reset() {
    console.log('重置layoutStore状态值')
    sidebarExpand.value = true
    tagList.value = []
  }

  return {
    sidebarExpand,
    changeSidebarExpand,
    tagList,
    addTag,
    removeTags,
    $reset
  }
})
