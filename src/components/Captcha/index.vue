<template>
  <div :class="loading ? 'captcha-img-disabled' : 'captcha-img'" @click="refreshCaptcha(!loading)">
    <el-image :src="captchaImage" style="width: 100%; height: 100%" fit="fill" />
  </div>
</template>

<script setup>
/**
 * 组件使用方法：
 * 1、loading参数控制组件加载状态，加载中的组件无法点击刷新验证码；
 * 2、父组件ref属性绑定的对象，例如captchaRef，通过captchaRef.value.initCaptcha()函数获取初始化的验证码。
 */
import { ref } from 'vue'
import Apis from '@/apis'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
const captchaKey = ref('')
const captchaImage = ref('')

/**
 * 刷新验证码
 * @param valid 是否允许刷新
 */
const refreshCaptcha = valid => {
  if (valid) {
    Apis.common.captcha
      .getCaptcha()
      .then(res => {
        captchaKey.value = res.data.captchaKey
        captchaImage.value = res.data.captchaImage
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })
  }
}

/**
 * 向父组件暴露的函数的参数和函数
 * captchaKey: 后端返回的验证码KEY值
 * initCaptcha(): 验证码初始化函数
 */
defineExpose({
  captchaKey: captchaKey, // defineExpose函数里不需要写.value
  initCaptcha: refreshCaptcha
})
</script>

<style lang="scss" scoped>
.captcha-img {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.captcha-img-disabled {
  width: 100%;
  height: 100%;
  cursor: not-allowed;
}
</style>
