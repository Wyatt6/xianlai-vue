<template>
  <div class="page-wrap" :class="[layoutStore.menubarExpand ? '' : 'menubar-hidden']">
    <Menubar />
    <div class="right-wrap">
      <!-- <el-button @click="layoutStore.changeMenubarExpand()">展开/收起</el-button> -->
      <div class="fixed-header">
        <Navbar />
        <Tagbar />
      </div>
      <!-- <Content /> -->
    </div>
  </div>
</template>

<script setup>
import Menubar from './components/Menubar/index.vue'
import Navbar from './components/Navbar/index.vue'
import Tagbar from './components/Tagbar/index.vue'
// import Content from './components/Content/index.vue'
import { watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthorityStore } from '@/stores/authority'
import { useLayoutStore } from '@/stores/layout'

const appStore = useAppStore()
const authorityStore = useAuthorityStore()
const layoutStore = useLayoutStore()

/**
 * 获取授权数据
 */
// watch(
//   () => authorityStore.exist,
//   (value, oldValue) => {
//     if (!value && !authorityStore.lock && !appStore.logoutLock) {
//       authorityStore.getAuthority()
//     }
//   },
//   { immediate: true }
// )
</script>

<style lang="scss" scoped>
@use './index.module.scss' as vars;

.page-wrap {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color-page);

  .right-wrap {
    height: 100%;
    margin-left: vars.$menubar-width;
    transition: margin-left #{vars.$menubar-transition-duration};

    .fixed-header {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1001;
      width: calc(100% - vars.$menubar-width);
      transition: width #{vars.$menubar-transition-duration};
    }
  }
}

.menubar-hidden {
  .right-wrap {
    margin-left: vars.$menubar-width-hidden !important;

    .fixed-header {
      width: calc(100% - #{vars.$menubar-width-hidden});
    }
  }
}
</style>
