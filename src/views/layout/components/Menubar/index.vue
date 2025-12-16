<template>
  <div class="menubar-wrap" :class="[Layout.menubarExpand ? '' : 'menubar-hidden']">
    <router-link :to="Path.data.INDEX">
      <div class="logo-container">
        <el-avatar class="logo" :size="34" shape="square" :src="logoSrc" />
        <span class="logo-title">{{ Option.data.menubar.logoTitle }}</span>
      </div>
    </router-link>
    <el-scrollbar>
      <el-menu
        :collapse="!Layout.menubarExpand"
        :unique-opend="true"
        popper-effect="dark"
        :background-color="Vars.menuBackgroundColor"
        :text-color="Vars.menuTextColor"
        :active-text-color="Vars.menuActiveTextColor"
        :default-active="activeMenuPath"
        router
      >
        <MenuItem v-for="item in Menu.data" :key="item.path" :menu="item" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import Vars from '../../index.module.scss'
import MenuItem from './MenuItem.vue'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { useOptionStore } from '@/stores/option'
import { useMenuStore } from '@/stores/menu'
import { usePathStore } from '@/stores/path'

const Option = useOptionStore()
const Menu = useMenuStore()
const Path = usePathStore()
const Layout = useLayoutStore()
const route = useRoute()

/**
 * 默认激活（高亮）的菜单项
 * 通过直接输入URL访问页面或刷新页面时，菜单都能激活对应的菜单项
 */
const activeMenuPath = computed(() => {
  const { path } = route
  return path // 对应的是v-for里的key的路径
})

/**
 * 菜单栏Logo
 */
const logoSrc = ref('/images/layout/logo.png') // TODO 自定义logo

const logoTitleColor = ref(Option.data.menubar.logoTitleColor)
const logoTitleWeight = ref(Option.data.menubar.logoTitleWeight)
const logoTitleSize = ref(`${Option.data.menubar.logoTitleSize}rem`)
</script>

<style lang="scss">
// 菜单栏收起状态二级菜单样式（通过修改全局el-popper实现自定义样式）
// 注意：这里的style标签没有限定词scoped，表明这是个全局的样式
@use '../../index.module.scss' as vars;

.el-popper {
  border: none !important;

  .el-menu-item {
    height: vars.$menu-item-height !important;
    line-height: vars.$menu-item-height !important;
  }

  .el-sub-menu__title {
    height: vars.$menu-item-height !important;
    line-height: vars.$menu-item-height !important;
  }

  .is-active .el-sub-menu__title {
    color: vars.$menu-active-sub-menu-text-color !important;
  }
}
</style>

<style lang="scss" scoped>
@use '../../index.module.scss' as vars;

// 去除菜单右侧白色边框
.el-menu {
  border: none !important;
}

// 菜单项（el-menu-item)样式
:deep(.el-menu-item) {
  height: vars.$menu-item-height !important;
  line-height: vars.$menu-item-height !important;
  margin-left: vars.$menu-item-margin-left !important;
  padding-right: vars.$menu-item-padding-right !important;

  span {
    width: 100%;
    overflow: hidden;
  }
}

// 子菜单项（el-sub-menu)样式
:deep(.el-sub-menu) {
  .el-sub-menu__title {
    height: vars.$menu-item-height !important;
    line-height: vars.$menu-item-height !important;
    margin-left: vars.$menu-item-margin-left !important;
    padding-right: vars.$menu-item-padding-right !important;

    span {
      width: calc(100% - 5.8rem);
      overflow: hidden;
    }
  }
}

// 菜单栏滚动条宽度
:deep(.el-scrollbar__bar.is-vertical) {
  right: 0;
  width: 0.5rem;
}

// 菜单栏展开状态
.menubar-wrap {
  width: vars.$menubar-width;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  background-color: vars.$menubar-color;
  transition: width #{vars.$menubar-transition-duration};

  // 取消链接的下划线
  a:-webkit-any-link {
    text-decoration: none !important;
  }

  .logo-container {
    height: 3.4rem;
    padding: 1rem 0 1rem 0;
    display: flex;
    align-items: center;

    .logo {
      margin-left: 1.5rem;
      margin-right: 1rem;
      transition: margin-right #{vars.$menubar-transition-duration};
    }

    .logo-title {
      font-family: Tahoma;
      width: calc(vars.$menubar-width - 1rem - 3.4rem - 3rem);
      transition: width #{vars.$menubar-transition-duration};
      color: v-bind(logoTitleColor);
      font-weight: v-bind(logoTitleWeight);
      font-size: v-bind(logoTitleSize);
      // 以下3个属性使得标题平滑显示
      height: 2.1rem;
      line-height: 2.1rem;
      overflow: hidden;
    }
  }

  .el-scrollbar {
    height: calc(100% - 5.4rem);
  }
}

// 菜单栏收起状态
.menubar-hidden {
  width: vars.$menubar-width-hidden !important;

  .logo-container {
    .logo {
      margin-right: 0 !important;
    }

    .logo-title {
      width: 0 !important;
    }
  }

  .el-scrollbar {
    height: calc(100% - 5.4rem);
  }
}
</style>
