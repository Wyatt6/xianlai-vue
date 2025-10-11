<template>
  <div class="navbar-wrap">
    <Hamburger class="hamburger-box" />
    <div class="navbar-right">
      <el-dropdown class="dropdown-menu-wrap" trigger="click">
        <div class="username-wrap">
          <span style="color: #303133; font-size: 1.7rem" class="username-box">{{ username }}</span>
          <LocalIcon name="ri-arrow-drop-down-fill" size="2.5rem" color="#303133" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided @click="logout()">
              <span style="color: #f56c6c">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import Hamburger from './Hamburger.vue'
import LocalIcon from '@/components/LocalIcon/index.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiStore } from '@/apis'
import { useSystemStore } from '@/stores/system'
import { usePathStore } from '@/stores/path'
import { useAuthorityStore } from '@/stores/authority'
import Logger from '@/utils/logger'
import Storage from '@/utils/storage'

const router = useRouter()
const System = useSystemStore()
const Api = useApiStore()
const Path = usePathStore()
const authorityStore = useAuthorityStore()

const username = ref('unknown')

/**
 * 退出登录
 */
async function logout() {
  // appStore.setLogoutLock()
  // await Api.request.iam.user
  //   .logout()
  //   .then(async res => {
  //     if (res && res.success) {
  //       console.log('退出登录成功')
  //       console.log('返回到登录页面')
  //       appStore.setLogoutLock()
  //       await appStore.initialize()
  //       console.groupEnd()
  //       await router.push(Routes.LOGIN)
  //       appStore.releaseLogoutLock()
  //     } else {
  //       console.log('退出登录失败')
  //     }
  //   })
  //   .catch(error => {
  //     // 异常已统一处理，此处忽略异常
  //   })
  // appStore.releaseLogoutLock()

  Logger.log('退出登录')
  System.setLogoutLock()
  await Api.request.iam.user.logout().then(async result => {
    if (result && result.success) {
      Logger.log('退出登录成功，返回到登录页面')
      await System.resetStoreAndStorage()
      await router.push(Path.data.LOGIN)
    } else {
      Logger.log('退出登录失败')
    }
  })
  System.releaseLogoutLock()
}
</script>

<style lang="scss" scoped>
@use '../../index.module.scss' as vars;

.navbar-wrap {
  width: 100%;
  height: vars.$navbar-height;
  background: vars.$navbar-color;
  border-bottom: 0.05rem solid #d8dce5;
  box-shadow: 0 0.1rem 0.4rem rgba(0, 21, 41, 0.08);

  .hamburger-box {
    line-height: 3.7rem;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background #{vars.$menubar-transition-duration};

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    justify-content: right;
    float: right;
    width: 25rem;
    height: 100%;

    .dropdown-menu-wrap {
      cursor: pointer; // 手指形状鼠标指针
      margin-left: 1.2rem;
      margin-right: 1.2rem;

      .username-wrap {
        display: flex;
        align-items: center;
        justify-content: right;
        position: relative;

        .username-box {
          max-width: 18rem;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
