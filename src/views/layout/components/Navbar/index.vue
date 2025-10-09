<template>
  <div class="navbar-wrap">
    <!-- 菜单栏伸缩按钮 -->
    <Hamburger class="hamburger-box" />
    <!-- 面包屑导航组件 -->
    <Breadcrumb class="breadcrumb-wrap" />
    <div class="navbar-right">
      <el-dropdown class="dropdown-menu-wrap" trigger="click">
        <div class="username-wrap">
          <div>
            <span style="color: #303133; font-size: 1.7rem">{{ username }}</span>
          </div>
          <LocalIcon name="ri-arrow-drop-down-fill" size="2.5rem" color="#303133" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="authorityStore.updateAuthority()">
              <span>刷新授权</span>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-popover trigger="hover" placement="left-start">
                <template #reference> 系统管理员 </template>
                <el-image :src="AdminWechatImg" />
              </el-popover>
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <span style="color: #f56c6c">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import AdminWechatImg from '@/assets/images/admin-wechat.jpg'
import Hamburger from './Hamburger.vue'
import Breadcrumb from './Breadcrumb.vue'
import LocalIcon from '@/components/LocalIcon/index.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Routes from '@/router/routes'
import { useAppStore } from '@/stores/app'
import { useAuthorityStore } from '@/stores/authority'
import Storage from '@/utils/storage'
import Apis from '@/apis'

const router = useRouter()
const appStore = useAppStore()
const authorityStore = useAuthorityStore()

const cachedUser = Storage.get(Storage.keys.USER)
const username = ref(cachedUser == null ? 'unknown' : cachedUser.username)

/**
 * 退出登录
 */
async function logout() {
  console.groupCollapsed('退出登录')
  appStore.setLogoutLock()
  await Apis.iam.user
    .logout()
    .then(async res => {
      if (res && res.success) {
        console.log('退出登录成功')
        console.log('返回到登录页面')
        appStore.setLogoutLock()
        await appStore.initialize()
        console.groupEnd()
        await router.push(Routes.LOGIN)
        appStore.releaseLogoutLock()
      } else {
        console.log('退出登录失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
  appStore.releaseLogoutLock()
  console.groupEnd()
}
</script>

<style lang="scss" scoped>
@import '../../index.module.scss';

.navbar-wrap {
  width: 100%;
  height: $--navbar-height;
  background: $--navbar-color;
  border-bottom: 0.05rem solid #d8dce5;
  box-shadow: 0 0.1rem 0.4rem rgba(0, 21, 41, 0.08);

  .hamburger-box {
    line-height: 3.7rem;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background #{$--sidebar-transition-duration};

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .breadcrumb-wrap {
    float: left;
    height: 100%;
    max-width: 100rem;
    overflow: hidden;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    float: right;
    height: 100%;

    .dropdown-menu-wrap {
      cursor: pointer; // 手指形状鼠标指针
      margin-right: 1.2rem;

      .username-wrap {
        display: flex;
        align-items: center;
        position: relative;
      }
    }
  }
}
</style>
