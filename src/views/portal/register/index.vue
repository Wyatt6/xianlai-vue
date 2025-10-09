<template>
  <div class="box-wrap">
    <div class="box-header">
      <div>
        <span class="title">注册 IntoEins 用户</span>
      </div>
      <div>
        <span class="sub-title">已有账号？</span>
        <span :class="loading ? 'sub-title-link__disabled' : 'sub-title-link'" @click="toLogin">点此登录</span>
      </div>
    </div>
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-form-item prop="username">
        <el-input size="large" placeholder="用户名" v-model="formModel.username" maxlength="16" clearable />
      </el-form-item>
      <el-form-item prop="password">
        <el-input size="large" placeholder="密码" v-model="formModel.password" type="password" maxlength="16" show-password />
      </el-form-item>
      <el-form-item prop="password2">
        <el-input size="large" placeholder="再次输入密码" v-model="formModel.password2" maxlength="16" show-password />
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
    <div>
      <span style="font-size: 1.4rem">提交注册表示您同意</span>
      <span style="font-size: 1.4rem; cursor: pointer; color: #409eff" @click="showTerms = true">使用条款和隐私保护政策</span>
      <span style="font-size: 1.4rem">相关约定</span>
      <Terms :show="showTerms" @close="showTerms = false" />
    </div>
    <el-button class="register-btn" type="primary" size="large" :loading="loading" @click="onRegister">
      <span class="register-btn-label">立即注册</span>
    </el-button>
  </div>
</template>

<script setup>
import Captcha from '@/components/Captcha/index.vue'
import Terms from './Terms.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Routes from '@/router/routes'
import Validator from '@/utils/validator'
import Apis from '@/apis'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const captchaRef = ref()

const formRef = ref()
const formModel = ref({
  username: '',
  password: '',
  password2: '',
  captcha: ''
})
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '长度3至16位', trigger: 'change' },
    { min: 3, max: 16, message: '长度3至16位', trigger: 'blur' },
    { validator: Validator.username(), trigger: 'change' },
    { validator: Validator.username(), trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度6至16位', trigger: 'change' },
    { min: 6, max: 16, message: '长度6至16位', trigger: 'blur' },
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

/**
 * 点击注册
 */
function onRegister() {
  console.groupCollapsed('注册新用户')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('注册信息格式验证通过')
      loading.value = true
      const userForm = {
        username: formModel.value.username,
        password: formModel.value.password,
        captchaKey: captchaRef.value.captchaKey,
        captcha: formModel.value.captcha
      }
      await Apis.iam.user
        .register(userForm)
        .then(res => {
          if (res && res.success) {
            console.log('注册成功，跳转到登录页面')
            loading.value = false
            console.groupEnd()
            ElMessageBox.alert('欢迎使用 WyLoop 系统，请登陆', '注册成功', {
              callback: action => {
                router.push(Routes.LOGIN)
              }
            })
          } else {
            console.log('注册失败')
            ElMessage.error(res && res.message ? res.message : '注册失败')
            loading.value = false
            console.groupEnd()

            // 自动刷新验证码
            captchaRef.value.initCaptcha(true)
            formModel.value.captcha = ''
          }
        })
        .catch(error => {
          // 异常已统一处理，此处忽略异常

          loading.value = false
          console.groupEnd()
        })
    } else {
      console.log('注册信息格式验证失败')
      console.groupEnd()
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

/**
 * 跳转到登录页面
 */
function toLogin() {
  if (!loading.value) {
    router.push(Routes.LOGIN)
  }
}

/**
 * 绑定验证码组件，挂载组件时初始化验证码
 */
onMounted(() => {
  captchaRef.value.initCaptcha(true)
})

const showTerms = ref(false)
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .sub-title {
    color: #40485b;
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
      color: #40485b;
      font-size: 2.5rem;
      font-weight: bold;
      font-family: Tahoma;
    }
  }

  .form-wrap {
    margin-top: 7rem;

    :deep(.el-input-group__append) {
      padding: 0;
    }

    .captcha-box {
      width: 15rem;
      height: 4rem;
    }
  }

  .register-btn {
    width: 100%;
    margin-top: 5rem;

    .register-btn-label {
      font-size: 1.8rem;
    }
  }
}
</style>
