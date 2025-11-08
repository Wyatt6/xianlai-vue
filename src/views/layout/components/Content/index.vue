<template>
  <div class="content-wrap" :class="[Layout.menubarExpand ? '' : 'menubar-hidden-content-wrap']">
    <RouterView v-slot="{ Component }">
      <!-- 问题：即使使用了KeepAlive也没有缓存组件，每次路由切换到组件时都会执行onMounted() -->
      <!-- 分析：检查路由配置发现组件里面还嵌套了一个只有RouterView的Placeholder.vue，而KeepAlive只能在最里层的RouterView下才会生效 -->
      <!-- 解决：重新配置路由表，不再使用Placeholder.vue -->
      <KeepAlive v-if="route.meta.keepAlive" :max="10">
        <component :is="Component" />
      </KeepAlive>
      <component :is="Component" v-else />
    </RouterView>
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
  bottom: 0;
  right: 0;
  width: calc(100% - vars.$menubar-width);
  height: calc(100% - vars.$navbar-height - vars.$tagbar-height);
  padding: $--padding-top $--padding-left-right 0 $--padding-left-right;
  overflow: hidden;
  box-sizing: border-box;
  transition: width #{vars.$menubar-transition-duration};
}

.menubar-hidden-content-wrap {
  width: calc(100% - vars.$menubar-width-hidden) !important;
}
</style>
