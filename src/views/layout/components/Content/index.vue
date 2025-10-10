<template>
  <div class="content-wrap">
    <router-view v-slot="{ Component, route }">
      <!-- TODO 使用KeepAlive也无法缓存组件状态，每次路由切换同样需要加载，还会钩子函数执行混乱 -->
      <keep-alive>
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
/**
 * 说明：
 * 主内容区，具备动画切换的效果，同时带动页面标签栏的动作
 */
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { tagPathException } from '@/router/tag_path_exception'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()

/**
 * 根据路由路径判断是否应该显示为页面标签
 * @param {*} path 路由路径
 * @returns true-应该显示为页面标签；false-不应该显示为页面标签
 */
function isTag(path) {
  return !tagPathException.includes(path)
}

// 监听主内容区路由变化，如果要添加页面标签则添加
watch(
  route,
  (value, oldValue) => {
    if (!isTag(value.path)) return
    const { fullPath, meta, name, params, path, query } = value
    const title = value.meta.title
    layoutStore.addTag({ fullPath, meta, name, params, path, query, title })
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '../../index.module.scss' as vars;

$--padding-top: 0.5rem;
$--padding-left-right: 0.8rem;

.content-wrap {
  width: 100%;
  height: 100%;
  padding: calc(vars.$navbar-height + vars.$tagbar-height + $--padding-top) $--padding-left-right 0 $--padding-left-right;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
