<template>
  <div class="page-wrap" :class="[useLayoutStore().menubarExpand ? '' : 'menubar-hidden']">
    <Menubar />
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
import Menubar from './components/Menubar/index.vue'
import Navbar from './components/Navbar/index.vue'
import Tagbar from './components/Tagbar/index.vue'
import Content from './components/Content/index.vue'
import { useLayoutStore } from '@/stores/layout'
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
