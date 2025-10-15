<template>
  <div class="content-wrap" :class="[Layout.menubarExpand ? '' : 'menubar-hidden-content-wrap']">
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
import { useLayoutStore } from '@/stores/layout'
import { hasText, notEmpty } from '@/utils/common'

const route = useRoute()
const Layout = useLayoutStore()

/**
 * 判断是否应该显示为页面标签
 */
function showTag(route) {
  return notEmpty(route.meta) && route.meta.showTag
}

// 监听主内容区路由变化，如果要添加页面标签则添加
watch(
  route,
  (value, oldValue) => {
    if (!showTag(value)) return
    const { fullPath, meta, name, params, path, query } = value
    let title = fullPath
    if (hasText(name)) title = name
    if (notEmpty(meta) && hasText(meta.tagTitle)) title = meta.tagTitle
    useLayoutStore().addTag({ fullPath, meta, name, params, path, query, title })
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '../../index.module.scss' as vars;

$--padding-top: 0.5rem;
$--padding-left-right: 0.7rem;

.content-wrap {
  position: fixed;
  width: calc(100% - vars.$menubar-width);
  height: 100%;
  padding: calc(vars.$navbar-height + vars.$tagbar-height + $--padding-top) $--padding-left-right 0 $--padding-left-right;
  overflow: hidden;
  box-sizing: border-box;
  transition: width #{vars.$menubar-transition-duration};
}

.menubar-hidden-content-wrap {
  width: calc(100% - vars.$menubar-width-hidden) !important;
}
</style>
