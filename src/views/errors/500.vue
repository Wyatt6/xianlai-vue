<template>
  <div class="err-container">
    <div class="err">
      <div class="err-content">
        <div class="err-content__title">500 Connection Fail</div>
        <div class="err-content__headline">抱歉，连接服务器失败，请稍后重试......</div>
        <div class="err-content__info">请单击下面的按钮尝试重建连接。</div>
        <el-button type="primary" size="large" round @click="router.go(-1)">重新连接</el-button>
        <el-button size="large" round @click="reLogin()">重新登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { usePathStore } from '@/stores/path'
import { useResetStore } from '@/stores/reset'

const System = useSystemStore()
const Reset = useResetStore()
const router = useRouter()

/**
 * 重新登录
 */
async function reLogin() {
  System.setLogoutLock()
  await Reset.resetStoreAndStorage()
  router.push(usePathStore().data.LOGIN)
  System.releaseLogoutLock()
}
</script>

<style lang="scss" scoped>
.err-container {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .err {
    width: 40rem;
    overflow: hidden;

    .err-content {
      position: relative;
      float: left;
      width: 40rem;
      padding: 3rem 0;
      overflow: hidden;

      &__title {
        font-size: 3.2rem;
        font-weight: bold;
        line-height: 4rem;
        color: #1482f0;
        opacity: 0;
        margin-bottom: 2rem;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
      }

      &__headline {
        font-size: 2rem;
        line-height: 2.4rem;
        color: #222;
        font-weight: bold;
        opacity: 0;
        margin-bottom: 1rem;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.1s;
        animation-fill-mode: forwards;
      }

      &__info {
        font-size: 1.3rem;
        line-height: 2.1rem;
        color: grey;
        opacity: 0;
        margin-bottom: 3rem;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.2s;
        animation-fill-mode: forwards;
      }

      @keyframes slideUp {
        0% {
          transform: translateY(6rem);
          opacity: 0;
        }

        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
    }
  }
}
</style>
