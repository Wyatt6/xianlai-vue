<template>
  <div class="box-wrap">
    <div class="box-header">
      <div>
        <span class="title">登录</span>
      </div>
      <div>
        <span class="sub-title">没有账号？</span>
        <span :class="loading ? 'sub-title-link__disabled' : 'sub-title-link'" @click="toRegister()">点此注册</span>
      </div>
    </div>
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-form-item prop="username">
        <el-input size="large" placeholder="用户名" v-model="formModel.username" :maxlength="uMaxLen" clearable />
      </el-form-item>
      <el-form-item prop="password">
        <el-input size="large" placeholder="密码" v-model="formModel.password" type="password" :maxlength="pMaxLen" show-password />
      </el-form-item>
      <el-form-item prop="captcha">
        <el-input size="large" placeholder="验证码" v-model="formModel.captcha" :maxlength="Option.data.captcha.length" clearable>
          <template #append>
            <div class="captcha-box">
              <Captcha ref="captchaRef" :loading="loading" />
            </div>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div class="sub-box">
      <div>
        <el-checkbox v-model="rememberMe" label="记住我" />
      </div>
      <div @click="toResetPassword()">
        <span class="sub-title-link">已有帐号，忘记密码？</span>
      </div>
    </div>
    <el-button class="login-btn" type="primary" size="large" :loading="loading" @click="onLogin()">
      <span class="login-btn-label">登 录</span>
    </el-button>
  </div>
</template>

<script setup>
import Captcha from '@/components/Captcha/index.vue'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '@/utils/storage'
import Validator from '@/utils/validator'
import Logger from '@/utils/logger'
import { useOptionStore } from '@/stores/option'
import { useApiStore } from '@/apis'

const loading = ref(false)
const router = useRouter()
const captchaRef = ref()
const rememberMe = ref(Storage.get(Storage.keys.REMEMBER_USERNAME) != null)
const Option = useOptionStore()
const Api = useApiStore()

const formRef = ref()
const formModel = ref({
  username: Storage.get(Storage.keys.REMEMBER_USERNAME) || '', // 自动填充记住的用户名
  password: '',
  captcha: ''
})
const uMinLen = Option.data.user.username.minLen
const uMaxLen = Option.data.user.username.maxLen
const pMinLen = Option.data.user.password.minLen
const pMaxLen = Option.data.user.password.maxLen
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'change' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'blur' },
    { validator: Validator.username(), trigger: 'change' },
    { validator: Validator.username(), trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'change' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'blur' },
    { validator: Validator.password(), trigger: 'change' },
    { validator: Validator.password(), trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: Validator.captcha(), trigger: 'blur' }
  ]
})

function onLogin() {
  Logger.log('用户登录')
  formRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      const input = {
        username: formModel.value.username,
        password: formModel.value.password,
        captchaKey: captchaRef.value.captchaKey,
        captcha: formModel.value.captcha
      }
      Api.request.iam.user
        .login(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('登录成功')
            const { token, tokenExpireTime } = result.data
            Logger.log('缓存登录数据')
            Storage.set(Storage.keys.TOKEN, token) // 用来下次自动登录
            Storage.set(Storage.keys.TOKEN_EXPIRE_TIME, tokenExpireTime)
            if (rememberMe.value) {
              Logger.log('记住用户名')
              Storage.set(Storage.keys.REMEMBER_USERNAME, input.username)
            } else {
              Storage.delete(Storage.keys.REMEMBER_USERNAME)
            }
            Logger.log('跳转到主页面')
            router.push('/')
          } else {
            Logger.log('登录失败')
            ElMessage.error(result && result.data && result.data.message ? result.data.message : '登录失败')
            // 自动刷新验证码
            captchaRef.value.initCaptcha(true)
            formModel.value.captcha = ''
          }
        })
    } else {
      ElMessage.error('输入格式错误')
      Logger.log('登录表单数据格式错误')
    }
  })
}

/**
 * 回车登录
 * @param event 键盘事件对象
 */
document.onkeydown = event => {
  if (event.keyCode === 13) {
    onLogin()
  }
}

function toRegister() {
  if (!loading.value) {
    router.push('/portal/register')
  }
}

function toResetPassword() {
  if (!loading.value) {
    router.push('/portal/reset-password')
  }
}

/**
 * 绑定验证码组件，挂载组件时初始化验证码
 */
onMounted(() => {
  captchaRef.value.initCaptcha(true)
})
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .sub-title {
    font-size: 1.4rem;
  }

  .sub-title-link {
    color: #409eff;
    font-size: 1.4rem;
    cursor: pointer;

    &__disabled {
      color: #409eff;
      font-size: 1.4rem;
      cursor: not-allowed;
    }
  }

  .box-header {
    width: 100%;
    height: 3.5rem;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: flex-end; // 下边对齐
    justify-content: space-between;

    .title {
      font-size: 3rem;
      font-weight: bold;
      font-family: Tahoma;
    }
  }

  .form-wrap {
    margin-top: 9rem;

    :deep(.el-input-group__append) {
      padding: 0;
    }

    .captcha-box {
      width: 15rem;
      height: 4rem;
    }
  }

  .sub-box {
    width: 100%;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .login-btn {
    width: 100%;
    margin-top: 5rem;

    .login-btn-label {
      font-size: 1.8rem;
    }
  }
}
</style>
