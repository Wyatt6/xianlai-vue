<template>
  <div class="menubar-wrap" :class="[layoutStore.menubarExpand ? '' : 'menubar-hidden']">
    <router-link :to="Routes.INDEX">
      <div class="logo-container">
        <el-avatar class="logo" :size="34" shape="square" :src="LogoImg" />
        <span class="logo-title">{{ SysOption.data.menubar.logoTitle }}</span>
      </div>
    </router-link>
    <el-scrollbar>
      <el-menu
        :collapse="!layoutStore.menubarExpand"
        :unique-opend="true"
        popper-effect="dark"
        :background-color="MenuStyles.menuColor"
        :text-color="MenuStyles.menuTextColor"
        :active-text-color="MenuStyles.menuActiveTextColor"
        :default-active="activeMenuPath"
        router
      >
        <MenuItem v-for="item in menus" :key="item.path" :menu="item" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import MenuStyles from '../../index.module.scss'
import LogoImg from '@/assets/images/logo.png'
import MenuItem from './MenuItem.vue'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import Routes from '@/router/routes'
import Menu from '@/utils/menu'
import { useSysOptionStore } from '@/stores/sys_option'

const SysOption = useSysOptionStore()
const layoutStore = useLayoutStore()
const router = useRouter()
const route = useRoute()

/**
 * 获取菜单数据（树形结构形成的森林）
 * 由于路由表中有很多路径并不是用来显示菜单的，只是用来跳转用，所以要把真正用来显示菜单的路由筛选出来
 */
const menus = computed(() => {
  const routes = Menu.getRouteRoots(router.getRoutes()) // getRoutes()返回扁平化的路由，即子路由也被提到第一级了
  return Menu.routesToMenus(routes)
})

/**
 * 默认激活（高亮）的菜单项
 * 通过直接输入URL访问页面或刷新页面时，菜单都能激活对应的菜单项
 */
const activeMenuPath = computed(() => {
  const { path } = route
  return path // 对应的是v-for里的key的路径
})
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
  z-index: 1001;
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
      margin-left: 0.8rem;
      margin-right: 1rem;
      transition: margin-right #{vars.$menubar-transition-duration};
    }

    .logo-title {
      font-family: Tahoma;
      color: #fff;
      font-weight: 700;
      font-size: 1.8rem;
      width: calc(vars.$menubar-width - 0.8rem - 34px - 2rem);
      transition: width #{vars.$menubar-transition-duration};
      // 以下3个属性使得标题平滑显示
      height: 2.1rem;
      line-height: 2.1rem;
      overflow: hidden;
    }
  }

  .el-scrollbar {
    height: calc(100% - 5.4rem);
  }

  .el-menu {
    width: vars.$menubar-width !important;
    transition: width #{vars.$menubar-transition-duration};
  }
}

// 菜单栏收起状态
.menubar-hidden {
  width: vars.$menubar-width-hidden !important;

  .logo {
    margin-right: 0 !important;
  }

  .logo-title {
    width: 0 !important;
  }

  .el-scrollbar {
    height: calc(100% - 5.4rem);
  }

  .el-menu {
    width: vars.$menubar-width-hidden !important;
  }
}
</style>
