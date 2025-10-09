<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbData" :key="item.path">
        <span class="redirect" v-if="index < breadcrumbData.length - 1 && item.meta.breadcrumbRedirect" @click="router.push(item.path)">
          {{ item.meta.title }}
        </span>
        <span class="no-redirect" v-else>{{ item.meta.title }}</span>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
/**
 * 说明：
 * 面包屑组件，路由表路径中满足meta && meta.isBreadcrumb && meta.title的才会被显示出来
 * 除了最后一个的面包屑不可点击，前面的其他面包屑都支持点击跳转
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isEmpty } from '@/utils/common'

const route = useRoute()
const router = useRouter()

// 获取面包屑的渲染数据
const breadcrumbData = ref([])
const getBreadcrumbData = () => {
  // route.matched为当前路由在路由表中从根节点往下匹配的路径上的路由节点组成的数组
  breadcrumbData.value = route.matched.filter(item => !isEmpty(item.meta) && item.meta.isBreadcrumb && item.meta.title)
}

// 监听路由变化
watch(
  route,
  () => {
    getBreadcrumbData()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@import '../../index.module.scss';

.breadcrumb {
  display: inline-block;
  font-size: 1.4rem;
  line-height: $--navbar-height;
  margin-left: 2rem;

  .no-redirect {
    color: #b1b9c4;
    cursor: text;
  }

  .redirect {
    color: black;
    cursor: pointer;
  }

  .redirect:hover {
    color: $--menu-active-text-color;
  }
}
</style>
