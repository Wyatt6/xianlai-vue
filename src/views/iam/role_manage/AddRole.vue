<template>
  <el-dialog draggable :model-value="props.show" title="新增角色" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="角色标识" prop="identifier">
        <el-input v-model="form.identifier" clearable />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="立即生效">
        <el-switch v-model="form.active" />
      </el-form-item>
      <el-form-item label="角色说明">
        <el-input v-model="form.description" type="textarea" />
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
import Logger from '@/utils/logger'

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
const formRef = ref(null)
const formRules = ref({
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  identifier: [{ required: true, trigger: 'blur', message: '请输入权限标识' }]
})
const form = ref({
  sortId: 1,
  identifier: null,
  name: null,
  active: false,
  description: null
})
// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.sortId = 1
      form.value.identifier = null
      form.value.name = null
      form.value.active = false
      form.value.description = null
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  Logger.log('新增角色')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      await Api.request.iam.role
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('新增角色成功')
            ElMessage.success('新增角色成功')
            onClose()
            emits('afterAdd', result.data.role.id) // 调用父组件afterAdd事件
          } else {
            Logger.log('新增角色失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增角色失败')
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
