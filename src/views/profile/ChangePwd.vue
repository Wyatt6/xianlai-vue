<template>
  <el-dialog :model-value="show" title="修改密码" @close="onClose()">
    <div class="input-wrap">
      <div class="input-box">
        <div style="width: 100%">
          <el-form ref="formRef" :rules="formRules" :model="form" label-position="right" label-width="auto" :disabled="loading">
            <el-form-item label="请输入当前密码" prop="oldPassword">
              <el-input v-model="form.oldPassword" type="password" maxlength="pMaxLen" show-password />
            </el-form-item>
            <el-form-item label="请输入新密码" prop="password1">
              <el-input v-model="form.password1" type="password" maxlength="pMaxLen" show-password />
            </el-form-item>
            <el-form-item label="请再次输入新密码" prop="password2">
              <el-input v-model="form.password2" type="password" maxlength="pMaxLen" show-password />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="onConfirm()">确定</el-button>
      <el-button @click="onClose()">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useApiStore } from '@/apis'
import { useOptionStore } from '@/stores/option'
import Validator from '@/utils/validator'

const Api = useApiStore()
const Option = useOptionStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  }
})
const emits = defineEmits(['close'])

const loading = ref(false)
const formRef = ref()
const form = ref({
  oldPassword: null,
  password1: null,
  password2: null
})
const pMinLen = Option.data.user.password.minLen
const pMaxLen = Option.data.user.password.maxLen
const formRules = ref({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'blur' },
    { validator: Validator.password(), trigger: 'blur' }
  ],
  password1: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'blur' },
    { validator: Validator.password(), trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (form.value.password1 !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// ----- 监听打开对话框动作进行初始化 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      form.value.oldPassword = null
      form.value.password1 = null
      form.value.password2 = null
      loading.value = false
    }
  }
)

// ----- 点击“取消”或关闭对话框 -----
const onClose = () => {
  // 调用父组件close事件
  emits('close')
}

// ----- 点击“确定” -----
const onConfirm = () => {
  console.log('修改密码')
  formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      const input = {
        oldPassword: form.value.oldPassword,
        newPassword: form.value.password1
      }
      await Api.request.iam.user
        .changePassword(null, input)
        .then(result => {
          if (result && result.success) {
            console.log('修改成功')
            ElMessage.success('密码已成功修改')
            onClose()
          } else {
            console.log('修改密码失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '修改密码失败')
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>

<style scoped>
.input-wrap {
  width: 100%;
  display: flex;
  justify-content: center;

  .input-box {
    width: 90%;
    display: flex;
    justify-content: center;
  }
}
</style>
