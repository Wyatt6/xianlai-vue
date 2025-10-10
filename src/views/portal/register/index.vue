<template>
  <div class="box-wrap">
    <div class="box-header">
      <div>
        <span class="title">注册</span>
      </div>
      <div>
        <span class="sub-title">已有账号？</span>
        <span :class="loading ? 'sub-title-link__disabled' : 'sub-title-link'" @click="toLogin()">点此登录</span>
      </div>
    </div>
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-form-item prop="username">
        <el-input size="large" placeholder="用户名" v-model="formModel.username" :maxlength="uMaxLen" clearable />
      </el-form-item>
      <el-form-item prop="password">
        <el-input size="large" placeholder="密码" v-model="formModel.password" type="password" :maxlength="pMaxLen" show-password />
      </el-form-item>
      <el-form-item prop="password2">
        <el-input size="large" placeholder="再次输入密码" v-model="formModel.password2" :maxlength="pMaxLen" show-password />
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
    <div>
      <span class="statement">注册代表您同意</span>
      <span class="statement" style="cursor: pointer; color: #409eff" @click="showTermsOfUse = true">使用条款</span>
      <span class="statement">和</span>
      <span class="statement" style="cursor: pointer; color: #409eff" @click="showPricacyPolicy = true">隐私保护政策</span>
      <span class="statement">相关约定</span>
      <TermsOfUse :show="showTermsOfUse" @close="showTermsOfUse = false" />
      <PrivacyPolicy :show="showPricacyPolicy" @close="showPricacyPolicy = false" />
    </div>
    <el-button class="register-btn" type="primary" size="large" :loading="loading" @click="onRegister()">
      <span class="register-btn-label">立即注册</span>
    </el-button>
  </div>
</template>

<script setup>
import Captcha from '@/components/Captcha/index.vue'
import TermsOfUse from './TermsOfUse.vue'
import PrivacyPolicy from './PrivacyPolicy.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOptionStore } from '@/stores/option'
import Validator from '@/utils/validator'
import Logger from '@/utils/logger'
import { useApiStore } from '@/apis'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const captchaRef = ref()
const Option = useOptionStore()
const Api = useApiStore()

const formRef = ref()
const formModel = ref({
  username: '',
  password: '',
  password2: '',
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
  password2: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (formModel.value.password !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: Validator.captcha(), trigger: 'blur' }
  ]
})

function onRegister() {
  Logger.log('注册新用户')
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
        .register(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('注册成功，跳转到登录页面')
            ElMessageBox.alert(`欢迎使用「${Option.data.system.name}」系统，请登陆`, '注册成功', {
              callback: action => {
                router.push('/portal/login')
              }
            })
          } else {
            Logger.log('注册失败')
            ElMessage.error(result && result.data && result.data.message ? result.data.message : '注册失败')
            // 自动刷新验证码
            captchaRef.value.initCaptcha(true)
            formModel.value.captcha = ''
          }
        })
    } else {
      ElMessage.error('输入格式错误')
      Logger.log('注册表单数据格式错误')
    }
  })
}

/**
 * 回车注册
 * @param event 键盘事件对象
 */
document.onkeydown = event => {
  if (event.keyCode === 13) {
    onRegister()
  }
}

function toLogin() {
  if (!loading.value) {
    router.push('/portal/login')
  }
}

/**
 * 绑定验证码组件，挂载组件时初始化验证码
 */
onMounted(() => {
  captchaRef.value.initCaptcha(true)
})

const showTermsOfUse = ref(false)
const showPricacyPolicy = ref(false)
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
    margin-bottom: 1.5rem;
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
    margin-top: 6rem;

    :deep(.el-input-group__append) {
      padding: 0;
    }

    .captcha-box {
      width: 15rem;
      height: 4rem;
    }
  }

  .statement {
    font-size: 1.4rem;
  }

  .register-btn {
    width: 100%;
    margin-top: 6rem;

    .register-btn-label {
      font-size: 1.8rem;
    }
  }
}
</style>
