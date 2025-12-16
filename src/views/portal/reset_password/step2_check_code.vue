<template></template>
<!-- <template>
  <div class="box-wrap">
    <el-form class="form-wrap" ref="formRef" :model="formModel" :rules="formRules" :disabled="loading">
      <el-input class="code-input" placeholder="校验码" v-model="formModel.code" size="large" maxlength="6" clearable />
    </el-form>
    <div class="btn-wrap">
      <el-button class="btn" type="primary" size="large" :loading="loading" @click="onCheck">
        <span class="btn-label">校验</span>
      </el-button>
    </div>
    <div class="btn-wrap">
      <el-button class="btn" size="large" :loading="loading" @click="toPre">
        <span class="btn-label">返回上一步</span>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import Validator from '~/utils/validator'
import Logger from '~/utils/logger'
import Storage from '~/utils/storage'
import { notEmptyString } from '~/utils/common'
import Apis from '~/http/apis'

const loading = ref(false)
const formRef = ref()
const formModel = ref({
  code: ''
})
const formRules = ref({
  captcha: [
    { required: true, message: '请输入校验码', trigger: 'blur' },
    { validator: Validator.emailCode(), trigger: 'blur' }
  ]
})
const emits = defineEmits(['pre', 'next'])

/**
 * 点击校验按钮
 */
function onCheck() {
  Logger.log('校验邮件校验码')
  formRef.value.validate(valid => {
    if (valid) {
      const input = {
        username: Storage.get(Storage.keys.RESET_PWD_USERNAME),
        emailCode: formModel.value.code
      }
      if (notEmptyString(input.username)) {
        loading.value = true
        Apis.reserved
          .checkEmailCode(null, input)
          .finally(() => {
            loading.value = false
          })
          .then(result => {
            if (result && result.success) {
              Logger.log('校验成功，进行下一步重置密码')
              ElMessage.success('邮件校验码正确')
              Storage.set(Storage.keys.RESET_PWD_CERTIFICATE, result.data.certificate)
              emits('next')
            } else {
              Logger.log('邮件校验码错误')
              ElMessage.error(result && result.data && result.data.message ? result.data.message : '邮件校验码错误')
            }
          })
      } else {
        ElMessage.error('出现错误，请重新发送邮件校验码')
        emits('pre')
      }
    } else {
      ElMessage.error('校验码格式错误')
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
    onCheck()
  }
}

/**
 * 点击上一步按钮
 */
function toPre() {
  emits('pre')
}
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .code-input {
    margin-top: 9rem;
    margin-bottom: 9.6rem;
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
