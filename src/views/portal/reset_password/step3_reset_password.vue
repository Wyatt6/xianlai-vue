<template>
  <div class="box-wrap">
    <el-result class="box result" v-if="successReset" icon="success" title="密码已重置">
      <template #extra>
        <el-button class="btn" type="primary" size="large" :loading="loading" @click="toLogin">
          <span class="btn-label">返回登录</span>
        </el-button>
      </template>
    </el-result>
    <div class="box" v-else>
      <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
        <el-form-item prop="password">
          <el-input size="large" placeholder="新密码" v-model="formModel.password" type="password" :maxlength="pMaxLen" show-password />
        </el-form-item>
        <el-form-item prop="password2">
          <el-input size="large" placeholder="再次输入新密码" v-model="formModel.password2" :maxlength="pMaxLen" show-password />
        </el-form-item>
      </el-form>
      <div class="btn-wrap">
        <el-button class="btn" type="primary" size="large" :loading="loading" @click="onConfirm">
          <span class="btn-label">确定</span>
        </el-button>
      </div>
      <div class="btn-wrap">
        <el-button class="btn" size="large" :loading="loading" @click="cancel">
          <span class="btn-label">取消</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ASC from '/app_settings_core'
import { ref } from 'vue'
import Validator from '~/utils/validator'
import Storage from '~/utils/storage'
import Logger from '~/utils/logger'
import { notEmptyString } from '~/utils/common'
import { useRouter } from 'vue-router'
import pathTable from '~/router/path_table'
import Apis from '~/http/apis'

const loading = ref(false)
const successReset = ref(false)
const router = useRouter()
const emits = defineEmits(['first'])

const formRef = ref()
const formModel = ref({
  password: '',
  password2: ''
})
const pMinLen = ASC.settings.portal.minPasswordLen
const pMaxLen = ASC.settings.portal.maxPasswordLen
const formRules = ref({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'change' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'blur' },
    { validator: Validator.password(), trigger: 'change' },
    { validator: Validator.password(), trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
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
  ]
})

/**
 * 清楚相关的浏览器缓存
 */
function clearRelatedStorage() {
  Storage.delete(Storage.keys.RESET_PWD_USERNAME)
  Storage.delete(Storage.keys.RESET_PWD_CERTIFICATE)
}

/**
 * 点击确定
 */
function onConfirm() {
  Logger.log('重置密码')
  formRef.value.validate(valid => {
    if (valid) {
      const input = {
        username: Storage.get(Storage.keys.RESET_PWD_USERNAME),
        certificate: Storage.get(Storage.keys.RESET_PWD_CERTIFICATE),
        password: formModel.value.password
      }
      if (notEmptyString(input.username) && notEmptyString(input.certificate)) {
        loading.value = true
        Apis.reserved
          .resetPassword(null, input)
          .finally(() => {
            loading.value = false
          })
          .then(result => {
            if (result && result.success) {
              Logger.log('重置密码成功')
              clearRelatedStorage()
              successReset.value = true
            } else {
              Logger.log('重置密码失败')
              ElMessage.error(result && result.data && result.data.message ? result.data.message : '重置密码失败')
            }
          })
      } else {
        ElMessage.error('出现错误，请重新发送邮件校验码')
        emits('first')
      }
    } else {
      ElMessage.error('密码格式错误')
      Logger.log('密码格式错误')
    }
  })
}

/**
 * 点击返回登录
 */
function toLogin() {
  if (!loading.value) {
    router.push(pathTable.LOGIN)
  }
}

/**
 * 点击取消按钮
 */
function cancel() {
  clearRelatedStorage()
  emits('first')
}
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .box {
    width: 100%;
    height: 100%;

    .form-wrap {
      margin-top: 6rem;
      margin-bottom: 7.8rem;
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

  .result {
    margin-top: 8rem;
    padding: 0;

    :deep(.el-result__extra) {
      width: 100%;
      margin-top: 4.4rem;
    }

    .btn {
      width: 100%;

      .btn-label {
        font-size: 1.8rem;
      }
    }
  }
}
</style>
