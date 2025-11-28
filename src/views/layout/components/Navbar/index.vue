<template>
  <div class="navbar-wrap">
    <Hamburger class="hamburger-box" />
    <div class="navbar-right">
      <el-dropdown class="dropdown-menu-wrap" trigger="click">
        <div class="username-wrap">
          <div class="avatar-wrap">
            <el-avatar shape="circle" :size="35" :src="avatarImg" />
          </div>
          <div class="username-box">
            <el-text class="username" truncated size="small" type="info">@{{ username }}</el-text>
            <el-text class="nickname" truncated size="large">{{ nickname }}</el-text>
          </div>
          <LocalIcon name="ri-arrow-drop-down-fill" size="2.5rem" color="#303133" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push(Path.data.PROFILE)">
              <LocalIcon class="dropdown-item-icon" name="ri-user-line" size="1.5rem" />
              <span>个人中心</span>
            </el-dropdown-item>
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
import FailPicture from '@/assets/images/fail_picture.png'
import Hamburger from './Hamburger.vue'
import LocalIcon from '@/components/LocalIcon/index.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiStore } from '@/apis'
import { useSystemStore } from '@/stores/system'
import { usePathStore } from '@/stores/path'
import { useResetStore } from '@/stores/reset'
import Storage from '@/utils/storage'
import { hasText, notEmpty } from '@/utils/common'
import { getAvatarImage } from '@/utils/file'

const router = useRouter()
const System = useSystemStore()
const Api = useApiStore()
const Path = usePathStore()
const Reset = useResetStore()

const avatarImg = ref(FailPicture)
const username = ref('unknown')
const user = Storage.get(Storage.keys.USER)
if (notEmpty(user)) {
  if (hasText(user.username)) username.value = user.username
}
const nickname = ref('默认用户昵称')
const profile = Storage.get(Storage.keys.PROFILE)
if (notEmpty(profile)) {
  // if (hasText(profile.nickname)) nickname.value = profile.nickname
  getAvatarImage(profile.avatar).then(result => {
    avatarImg.value = result
  })
}

/**
 * 退出登录
 */
async function logout() {
  console.log('退出登录')
  System.setLogoutLock()
  await Api.request.iam.user.logout().then(async result => {
    if (result && result.success) {
      console.log('退出登录成功，返回到登录页面')
      await Reset.resetStoreAndStorage()
      await router.push(Path.data.LOGIN)
    } else {
      console.log('退出登录失败')
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

        .avatar-wrap {
          // width: 100%;
          // height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;

          // 禁止头像图片拖动
          :deep(.el-avatar img) {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
          }
        }

        .username-box {
          max-width: 18rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;

          .username {
          }

          .nickname {
          }
        }
      }
    }
  }
}

.dropdown-item-icon {
  margin-right: 0.5rem;
}
</style>
