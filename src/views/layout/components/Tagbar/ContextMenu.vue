<template>
  <ul class="context-menu-container">
    <li @click="onRefreshClick">刷新</li>
    <li @click="onCloseAllClick">全部关闭</li>
    <li @click="onCloseRightClick">关闭右侧</li>
    <li @click="onCloseOtherClick">关闭其他</li>
  </ul>
</template>

<script setup>
/**
 * 说明：
 * 标签页右键菜单，实现了刷新、关闭右侧、关闭其他的菜单功能
 * index：当前标签页在列表中的下标，Number，必填
 * path: 当前标签页的路由路径，String，必填
 */
import { defineProps } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { usePathStore } from '@/stores/path'

const router = useRouter()
const route = useRoute()
const Layout = useLayoutStore()
const Path = usePathStore()

const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  tagPath: {
    type: String,
    required: true
  }
})

/**
 * 查找路径为path的Tag在列表中的下标
 * @param {*} tagList
 * @param {*} path
 * @returens 下标
 */
function getTagIndexByPath(tagList, path) {
  let tagIndex = -1
  for (let i = 0; i < tagList.length; i++) {
    if (tagList[i].fullPath === path) {
      tagIndex = i
      break
    }
  }
  return tagIndex
}

function onRefreshClick() {
  router.go(0)
}

async function onCloseAllClick() {
  await Layout.removeTags({ mode: 'all' })
  router.push(Path.data.INDEX)
}

async function onCloseRightClick() {
  const activeIndex = getTagIndexByPath(Layout.tagList, route.path)
  await Layout.removeTags({ mode: 'right', index: props.index })
  // 如果激活页面标签在当前页面标签的右边，则跳转到该当前页面
  if (activeIndex > props.index) {
    router.push(props.tagPath)
  }
}

const onCloseOtherClick = async () => {
  await Layout.removeTags({ mode: 'other', index: props.index })
  // 如果在未激活的页面标签关闭其他标签，则跳转到该标签的页面
  if (!(props.tagPath === route.path)) {
    router.push(props.tagPath)
  }
}
</script>

<style lang="scss" scoped>
.context-menu-container {
  position: fixed;
  background: #fff;
  z-index: 3000;
  list-style-type: none;
  padding: 0.5rem 0;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  font-weight: 400;
  color: #333;
  box-shadow: 0.2rem 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.3);

  li {
    margin: 0;
    padding: 0.7rem 1.6rem;
    cursor: pointer;

    &:hover {
      background: #eee;
    }
  }
}
</style>
