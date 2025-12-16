<template></template>
<!-- <template>
  <div class="box-wrap">
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-form-item prop="username">
        <el-input size="large" placeholder="用户名" v-model="formModel.username" :maxlength="uMaxLen" clearable />
      </el-form-item>
      <el-form-item prop="email">
        <el-input size="large" placeholder="电子邮箱" v-model="formModel.email" clearable />
      </el-form-item>
      <el-form-item prop="captcha">
        <el-input size="large" placeholder="验证码" v-model="formModel.captcha" maxlength="5" clearable>
          <template #append>
            <div class="captcha-box">
              <Captcha ref="captchaRef" :loading="loading" />
            </div>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div class="btn-wrap">
      <el-button class="btn" type="primary" size="large" :loading="loading" :disabled="freezed" @click="onSend">
        <span class="btn-label" v-if="freezed">发送校验码({{ seconds }}秒)</span>
        <span class="btn-label" v-else>发送校验码</span>
      </el-button>
    </div>
    <div class="btn-wrap">
      <el-button class="btn" size="large" :loading="loading" @click="toNext">
        <span class="btn-label">下一步</span>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import Captcha from '@/components/Captcha/index.vue'
import { ref, onMounted } from 'vue'
import Validator from '@/utils/validator'
import Storage from '@/utils/storage'
import Logger from '@/utils/logger'
import { ElMessage } from 'element-plus'
import { useOptionStore } from '@/stores/option'
import { useApiStore } from '@/apis'

const Option = useOptionStore()
const Apis = useApiStore()
const loading = ref(false)
const freezed = ref(false)
const captchaRef = ref()

const formRef = ref()
const formModel = ref({
  username: '',
  email: '',
  captcha: ''
})
const uMinLen = Option.data.user.username.minLen
const uMaxLen = Option.data.user.username.maxLen
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'change' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'blur' },
    { validator: Validator.username(), trigger: 'change' },
    { validator: Validator.username(), trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { validator: Validator.email(), trigger: 'change' },
    { validator: Validator.email(), trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: Validator.captcha(), trigger: 'blur' }
  ]
})

/**
 * 倒计时时钟
 */
const endtime = ref(0)
const seconds = ref(60)
let countdown = null
function updateCoutdown() {
  const now = new Date().getTime()
  const interval = endtime.value - now
  if (interval <= 0) {
    clearInterval(countdown)
    Storage.delete(Storage.keys.RESET_PWD_EMAIL_CODE_COUNTDOWN_ENDTIME)
    freezed.value = false
    return
  } else {
    seconds.value = Math.ceil(interval / 1000)
  }
}

/**
 * 点击发送校验码按钮
 */
function onSend() {
  Logger.log('发送邮件校验码')
  formRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      const input = {
        username: formModel.value.username,
        email: formModel.value.email,
        captchaKey: captchaRef.value.captchaKey,
        captcha: formModel.value.captcha
      }
      Apis.reserved
        .sendEmailCode(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('发送成功')
            ElMessage.success('邮件校验码已发送')
            Storage.set(Storage.keys.RESET_PWD_USERNAME, input.username)
            Logger.log('启动倒计时')
            endtime.value = new Date().getTime() + 60 * 1000
            countdown = setInterval(updateCoutdown, 1000)
            Storage.set(Storage.keys.RESET_PWD_EMAIL_CODE_COUNTDOWN_ENDTIME, endtime.value)
            freezed.value = true
          } else {
            Logger.log('发送失败')
            ElMessage.error(result && result.data && result.data.message ? result.data.message : '发送失败')
            // 自动刷新验证码
            captchaRef.value.initCaptcha(true)
            formModel.value.captcha = ''
          }
        })
    } else {
      ElMessage.error('输入格式错误')
      Logger.log('表单输入格式错误')
    }
  })
}

/**
 * 回车
 * @param event 键盘事件对象
 */
document.onkeydown = event => {
  if (event.keyCode === 13) {
    onSend()
  }
}

/**
 * 点击下一步按钮
 */
const emits = defineEmits(['next'])
function toNext() {
  emits('next')
}

onMounted(() => {
  // 绑定验证码组件，挂载组件时初始化验证码
  captchaRef.value.initCaptcha(true)
  // 初始化发送验证码倒计时
  endtime.value = Storage.get(Storage.keys.RESET_PWD_EMAIL_CODE_COUNTDOWN_ENDTIME)
  if (endtime.value != null) {
    const now = new Date().getTime()
    const interval = endtime.value - now
    if (interval > 0) {
      countdown = setInterval(updateCoutdown, 1000)
      seconds.value = Math.ceil(interval / 1000)
      freezed.value = true
    }
  }
})
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .form-wrap {
    margin-top: 4rem;
    margin-bottom: 4rem;

    :deep(.el-input-group__append) {
      padding: 0;
    }

    .captcha-box {
      width: 15rem;
      height: 4rem;
    }
  }

  .btn-wrap {
    width: 100%;
    margin-top: 1rem;

    .btn {
      width: 100%;

      .btn-label {
        font-size: 1.8rem;
      }
    }
  }
}
</style> -->
