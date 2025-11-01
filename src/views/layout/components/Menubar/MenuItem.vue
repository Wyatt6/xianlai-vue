<template>
  <el-sub-menu v-if="showMenu && menu.children && menu.children.length > 0" :index="menu.path">
    <template #title>
      <div v-if="menu.icon" class="icon-wrap">
        <el-icon v-if="menu.icon.includes('el-')" size="2rem">
          <component :is="menu.icon.substring(3, menu.icon.length)" />
        </el-icon>
        <LocalIcon v-else class="custom-icon" :name="menu.icon" size="2rem" />
      </div>
      <span class="title">{{ menu.title }}</span>
    </template>
    <MenuItem v-for="item in menu.children" :key="item.path" :menu="item" />
  </el-sub-menu>
  <el-menu-item v-else-if="showMenu" :index="menu.path">
    <div v-if="menu.icon" class="icon-wrap">
      <el-icon v-if="menu.icon.includes('el-')" size="2rem">
        <component :is="menu.icon.substring(3, menu.icon.length)" />
      </el-icon>
      <LocalIcon v-else class="custom-icon" :name="menu.icon" size="2rem" />
    </div>
    <template #title>
      <span class="title">{{ menu.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup>
/**
 * 说明：
 * 侧边栏菜单组件，接受菜单数组menus的元素menu对象作为输入
 * 如果当前菜单有子菜单就用<el-sub-menu>
 * 如果没有子菜单，就用<el-menu-item>
 * 注意<el-submenu>是旧版本^1.0.2-beta.28的标签了
 */
import LocalIcon from '@/components/LocalIcon/index.vue'
import { computed } from 'vue'
import MenuItem from './MenuItem.vue'
import Storage from '@/utils/storage'

const props = defineProps({
  menu: {
    type: Object,
    required: true
  }
})

const showMenu = computed(() => {
  if (props.menu.needPermission) {
    const permissions = Storage.get(Storage.keys.PERMISSIONS)
    return permissions.indexOf(props.menu.permission) > -1
  } else {
    return true
  }
})
</script>

<style lang="scss" scoped>
.icon-wrap {
  margin-left: 0.65rem;
  margin-right: 1rem;

  :deep(.el-icon) {
    width: 2rem;
    height: 2rem;
    margin-right: 0;
  }

  .custom-icon {
    display: flex;
    align-items: center;
    width: 2rem;
    height: 2rem;
  }
}
</style>
