<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="10rem" label-position="right">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" clearable />
      </el-form-item>
      <el-form-item label="状态">
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
import { useApiStore } from '@/apis'
import { useOptionStore } from '@/stores/option'
import Logger from '@/utils/logger'
import Validator from '@/utils/validator'

const Api = useApiStore()
const Option = useOptionStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  },
  nowRow: {
    type: Object
  }
})
const emits = defineEmits(['close', 'afterEdit'])

const title = ref('')
const formRef = ref(null)
const uMinLen = Option.data.user.username.minLen
const uMaxLen = Option.data.user.username.maxLen
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'change' },
    { min: uMinLen, max: uMaxLen, message: `长度${uMinLen}至${uMaxLen}位`, trigger: 'blur' },
    { validator: Validator.username(), trigger: 'change' },
    { validator: Validator.username(), trigger: 'blur' }
  ]
})
const form = ref({
  username: null,
  active: null
})
const loading = ref(false)

/**
 * 表单参数初始化函数
 */
function initForm() {
  title.value = '修改用户【' + props.nowRow.username + '】信息'
  // 用当前角色数据渲染表单初始数据
  form.value.username = props.nowRow.username
  form.value.active = props.nowRow.active
  loading.value = false
}

// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      initForm()
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  Logger.log('修改用户信息')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      if (form.value.username === props.nowRow.username && form.value.active === props.nowRow.active) {
        Logger.log('用户信息无修改')
        ElMessage.info('用户信息无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        username: form.value.username,
        active: form.value.active
      }
      await Api.request.iam.user
        .editUserInfo(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('修改用户信息成功')
            ElMessage.success('保存成功')
            onClose()
            console.log(result)
            emits('afterEdit', result.data.userInfo) // 调用父组件afterEdit事件
          } else {
            Logger.log('修改用户信息失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '修改用户信息失败')
          }
        })
    }
  })
}

/**
 * 点击“取消”或关闭对话框
 */
function onClose() {
  // 调用父组件close事件
  emits('close')
}
</script>
