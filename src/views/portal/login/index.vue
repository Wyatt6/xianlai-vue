<template>
  <div class="box-wrap">
    <div class="box-header">
      <div>
        <span class="title">登录 IntoEins</span>
      </div>
      <div>
        <span class="sub-title">没有账号？</span>
        <span :class="loading ? 'sub-title-link__disabled' : 'sub-title-link'" @click="toRegister">点此注册</span>
      </div>
    </div>
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-form-item prop="username">
        <el-input size="large" placeholder="用户名" v-model="formModel.username" maxlength="16" clearable />
      </el-form-item>
      <el-form-item prop="password">
        <el-input size="large" placeholder="密码" v-model="formModel.password" type="password" maxlength="16" show-password />
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
    <div class="sub-box">
      <div>
        <el-checkbox v-model="rememberMe" label="记住我" />
      </div>
      <!-- TODO 忘记密码 -->
      <div @click="ElMessage.warning('功能暂未开放，请联系管理员核实身份')">
        <span class="sub-title-link">已有帐号，忘记密码？</span>
      </div>
    </div>
    <el-button class="login-btn" type="primary" size="large" :loading="loading" @click="onLogin">
      <span class="login-btn-label">登 录</span>
    </el-button>
    <el-divider />
    <div class="footer">
      <div>
        <span>&copy; 2025 Wyatt</span>
      </div>
      <div>
        <span>欢迎使用 IntoEins 系统！如有问题，</span>
        <el-popover trigger="hover" placement="top">
          <template #reference>
            <span style="color: #409eff; cursor: pointer">请联系管理员</span>
          </template>
          <el-image :src="AdminWechatImg" />
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import Captcha from '@/components/Captcha/index.vue'
import AdminWechatImg from '@/assets/images/admin-wechat.jpg'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Routes from '@/router/routes'
import Validator from '@/utils/validator'
import Storage from '@/utils/storage'
import { useApiStore } from '@/apis'

const router = useRouter()
const loading = ref(false)
const captchaRef = ref()
const rememberMe = ref(Storage.get(Storage.keys.REMEMBER_USERNAME) != null)

const formRef = ref()
const formModel = ref({
  username: Storage.get(Storage.keys.REMEMBER_USERNAME) || '', // 自动填充记住的用户名
  password: '',
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
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: Validator.captcha(), trigger: 'blur' }
  ]
})

/**
 * 登录
 */
function onLogin() {
  console.groupCollapsed('用户登录')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('登录信息格式验证通过')
      loading.value = true

      const userForm = {
        username: formModel.value.username,
        password: formModel.value.password,
        captchaKey: captchaRef.value.captchaKey,
        captcha: formModel.value.captcha
      }
      await Api.request.iam.user
        .login(userForm)
        .then(async res => {
          if (res && res.success) {
            console.log('登录认证成功')
            const { user, token, tokenExpiredTime } = res.data

            // TODO 下次升级时用profile
            console.log('缓存user对象')
            Storage.set(Storage.keys.USER, user)
            console.log('缓存token令牌')
            Storage.set(Storage.keys.TOKEN_KEY, token) // 用来下次自动登录
            Storage.set(Storage.keys.TOKEN_EXPIRED_TIME_KEY, tokenExpiredTime)
            console.log('记住用户名')
            if (rememberMe.value) {
              Storage.set(Storage.keys.REMEMBER_USERNAME, user.username)
            }

            loading.value = false
            console.log('跳转到主页面')
            console.groupEnd()
            router.push(Routes.INDEX)
          } else {
            console.log('登录失败')
            ElMessage.error(res && res.message ? res.message : '登录失败')
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
      console.log('登录信息格式验证通过失败')
      console.groupEnd()
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

/**
 * 跳转到注册页面（“点此注册”按钮）
 */
function toRegister() {
  if (!loading.value) {
    router.push(Routes.REGISTER)
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
    margin-bottom: 2.5rem;
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

  .sub-box {
    width: 100%;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .login-btn {
    width: 100%;
    margin-top: 3rem;
    margin-bottom: 2rem;

    .login-btn-label {
      font-size: 1.8rem;
    }
  }

  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #40485b;
    font-size: 1.5rem;
  }
}
</style>
