<template>
  <div class="page-wrap" :class="[layoutStore.sidebarExpand ? '' : 'sidebar-hidden']">
    <Sidebar />
    <div class="right-wrap">
      <div class="fixed-header">
        <Navbar />
        <Tagbar />
      </div>
      <Content />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'
import Tagbar from './components/Tagbar/index.vue'
import Content from './components/Content/index.vue'
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
watch(
  () => authorityStore.exist,
  (value, oldValue) => {
    if (!value && !authorityStore.lock && !appStore.logoutLock) {
      authorityStore.getAuthority()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@import './index.module.scss';

.page-wrap {
  width: 100%;
  height: 100%;
  background-color: #f2f3f5;

  .right-wrap {
    height: 100%;
    margin-left: $--sidebar-width;
    transition: margin-left #{$--sidebar-transition-duration};

    .fixed-header {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1001;
      width: calc(100% - #{$--sidebar-width});
      transition: width #{$--sidebar-transition-duration};
    }
  }
}

.sidebar-hidden {
  .right-wrap {
    margin-left: $--sidebar-width-hidden !important;

    .fixed-header {
      width: calc(100% - #{$--sidebar-width-hidden});
    }
  }
}
</style>
