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
              <LocalIcon class="dropdown-item-icon" name="ri-logout-box-r-line" size="1.5rem" color="#f56c6c" />
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
import Logger from '@/utils/logger'
import Storage from '@/utils/storage'
import { hasText, notEmpty } from '@/utils/common'

const router = useRouter()
const System = useSystemStore()
const Api = useApiStore()
const Path = usePathStore()

const username = ref('unknown')
if (notEmpty(Storage.get(Storage.keys.USER))) {
  const user = Storage.get(Storage.keys.USER)
  if (hasText(user.username)) username.value = user.username
}
if (notEmpty(Storage.get(Storage.keys.PROFILE))) {
  const profile = Storage.get(Storage.keys.PROFILE)
  if (hasText(profile.nickname)) username.value = profile.nickname
}

/**
 * 退出登录
 */
async function logout() {
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

.dropdown-item-icon {
  margin-right: 0.5rem;
}
</style>
