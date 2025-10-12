<template>
  <div class="tagbar-wrap">
    <el-scrollbar class="tagbar">
      <router-link
        class="tagbar-item"
        :class="isActive(tag) ? 'active' : ''"
        :style="{
          backgroundColor: isActive(tag) ? TagStyles.tagbarActiveTagColor : '',
          borderColor: isActive(tag) ? TagStyles.tagbarActiveTagColor : ''
        }"
        v-for="(tag, index) in Layout.tagList"
        :key="tag.fullPath"
        :to="{ path: tag.fullPath }"
        @contextmenu.prevent="openContextMenu($event, index, tag.fullPath)"
      >
        {{ tag.title }}
        <LocalIcon style="margin-left: 0.3rem" name="ri-close-circle-line" size="1.4rem" @click.prevent.stop="onCloseClick(tag, index)" />
      </router-link>
    </el-scrollbar>
    <ContextMenu v-show="visible" :style="menuStyle" :index="selectIndex" :tagPath="selectTagPath" />
  </div>
</template>

<script setup>
import LocalIcon from '@/components/LocalIcon/index.vue'
import TagStyles from '../../index.module.scss'
import ContextMenu from './ContextMenu.vue'
import { ref, reactive, watch } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import { useRouter, useRoute } from 'vue-router'
import { usePathStore } from '@/stores/path'

const Layout = useLayoutStore()
const router = useRouter()
const route = useRoute()
const Path = usePathStore()

/**
 * 标签是否被选中
 */
function isActive(tag) {
  return tag.path === route.path
}

/**
 * 关闭页面标签
 * @param tag   标签对象
 * @param index 标签在tagList中的下标
 */
async function onCloseClick(tag, index) {
  // 如果关闭的是激活页面
  if (isActive(tag)) {
    // 则将其右边第一个页面作为新的激活页面
    if (index + 1 < Layout.tagList.length) {
      await Layout.removeTags({ mode: 'index', index })
      router.push(Layout.tagList[index].fullPath) // 注意这里的tagList已经是新的
    } else if (index > 0) {
      // 如果右边已经没有了标签，则将其左边第一个页面作为新的激活页面
      await Layout.removeTags({ mode: 'index', index })
      router.push(Layout.tagList[index - 1].fullPath) // 注意这里的tagList已经是新的
    } else {
      // 如果左边也已经没有了标签：如果最后要关闭的是主页，不执行关闭；否则关闭标签后，回到主页
      if (tag.fullPath !== Path.data.INDEX && tag.fullPath !== Path.data.INDEX_REDIRECT) {
        await Layout.removeTags({ mode: 'index', index })
        router.push(Path.data.INDEX)
      }
    }
  } else {
    Layout.removeTags({ mode: 'index', index })
  }
}

// ----- 右键菜单相关 -----
const selectIndex = ref(0)
const selectTagPath = ref('')
const visible = ref(false)
const menuStyle = reactive({
  left: 0,
  top: 0
})
/**
 * 打开右键菜单
 */
function openContextMenu(e, index, tagPath) {
  const { x, y } = e
  menuStyle.left = x / 10 + 'rem'
  menuStyle.top = y / 10 + 'rem'
  selectIndex.value = index
  selectTagPath.value = tagPath
  visible.value = true
}
/**
 * 关闭右键菜单
 */
function closeContextMenu() {
  visible.value = false
}

/**
 * 监听页面标签关闭事件
 */
watch(
  visible,
  (value, oldValue) => {
    if (value) {
      document.body.addEventListener('click', closeContextMenu)
    } else {
      document.body.removeEventListener('click', closeContextMenu)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '../../index.module.scss' as vars;

// 链接取消下划线
a {
  text-decoration: none !important;
}

// 标签栏隐藏滚动条
:deep(.el-scrollbar__bar) {
  display: none !important;
}

// 调整关闭按钮的位置
:deep(.awesome-svg-loader-icon svg) {
  vertical-align: middle;
  margin-top: -0.25rem;
}

.tagbar-wrap {
  width: 100%;
  height: vars.$tagbar-height;
  background: vars.$tagbar-color;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tagbar {
    .tagbar-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 2.5rem;
      line-height: 2.5rem;
      border: 0.1rem solid #ccd1dd;
      border-top-right-radius: 0.6rem;
      border-top-left-radius: 0.6rem;
      color: black;
      background: white;
      padding: 0 0.8rem;
      font-size: 1.2rem;
      margin-left: 0.5rem;
      margin-top: 0.4rem;
      // 禁止鼠标右键点击标签页打开菜单时选中标签标题
      user-select: none; // 标准
      -moz-user-select: none; // 火狐
      -webkit-user-select: none; // webkit (Chrome, Safari)
      -ms-user-select: none; // IE10 / Edge

      &:first-of-type {
        margin-left: 1.5rem;
      }

      &:last-of-type {
        margin-right: 1.5rem;
      }

      &.active {
        color: #fff;

        &::before {
          content: '';
          background: #ffffff;
          display: inline-block;
          width: 0.8rem;
          height: 0.8rem;
          border-radius: 50%;
          position: relative;
          margin-right: 0.4rem;
        }
      }
    }
  }
}
</style>
