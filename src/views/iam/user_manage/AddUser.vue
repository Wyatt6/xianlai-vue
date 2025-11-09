<template>
  <el-dialog draggable :model-value="props.show" title="创建用户" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :maxlength="uMaxLen" clearable />
      </el-form-item>
      <el-form-item label="初始密码" prop="password">
        <el-input v-model="form.password" :maxlength="pMaxLen" clearable />
      </el-form-item>
      <el-form-item label="状态" prop="active">
        <el-switch v-model="form.active" active-text="正常" inactive-text="冻结" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm()" :loading="loading">确定</el-button>
      <el-button @click="onClose()">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useOptionStore } from '@/stores/option'
import { useApiStore } from '@/apis'
import Validator from '@/utils/validator'

const Option = useOptionStore()
const Api = useApiStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  }
})
const emits = defineEmits(['close', 'afterAdd'])

const loading = ref(false)
const formRef = ref()
const uMinLen = Option.data.user.username.minLen
const uMaxLen = Option.data.user.username.maxLen
const pMinLen = Option.data.user.password.minLen
const pMaxLen = Option.data.user.password.maxLen
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'blur' },
    { validator: Validator.username(), trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: pMinLen, max: pMaxLen, message: `长度${pMinLen}至${pMaxLen}位`, trigger: 'blur' },
    { validator: Validator.password(), trigger: 'blur' }
  ]
})
const form = ref({
  username: null,
  password: null,
  active: false
})
// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.username = null
      form.value.password = null
      form.value.active = false
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  console.log('创建用户')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      await Api.request.iam.user
        .createUser(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('创建用户成功')
            ElMessage.success('创建用户成功')
            onClose()
            emits('afterAdd', result.data.user.id) // 调用父组件afterAdd事件
          } else {
            console.log('创建用户失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '创建用户失败')
          }
        })
    }
  })
}

// ----- 点击“取消”或关闭对话框 -----
const onClose = () => {
  // 调用父组件close事件
  emits('close')
}
</script>
