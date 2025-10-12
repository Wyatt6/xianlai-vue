<template>
  <div class="hamburger-wrap" @click="Layout.changeMenubarExpand()">
    <LocalIcon class="hamburger" :name="iconName" />
  </div>
</template>

<script setup>
/**
 * 说明：
 * 放在顶部导航栏左侧的菜单栏伸缩按钮
 */
import LocalIcon from '@/components/LocalIcon/index.vue'
import { computed } from 'vue'
import { useLayoutStore } from '@/stores/layout'

const Layout = useLayoutStore()

/**
 * 根据展开收起状态显示对应的图标
 */
const iconName = computed(() => {
  return Layout.menubarExpand ? 'ri-menu-fold-fill' : 'ri-menu-unfold-fill'
})
</script>

<style lang="scss" scoped>
.hamburger-wrap {
  display: flex;
  align-items: center;
  padding: 0 1rem;

  .hamburger {
    display: inline-block;
    vertical-align: middle;
    width: 2rem;
    height: 2rem;
  }
}
</style>
