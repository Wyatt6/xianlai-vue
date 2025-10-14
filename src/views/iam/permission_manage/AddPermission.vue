<template>
  <el-dialog draggable :model-value="props.show" title="新增权限" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="权限标识" prop="identifier">
        <el-input v-model="form.identifier" clearable />
      </el-form-item>
      <el-form-item label="权限名称">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="权限说明">
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
import { defineProps, defineEmits, ref, watch } from 'vue'
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
const formRef = ref()
const formRules = ref({
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  identifier: [{ required: true, trigger: 'blur', message: '请输入权限标识' }]
})
const form = ref({
  sortId: 1,
  identifier: null,
  name: null,
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
  Logger.log('新增权限')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      await Api.request.iam.permission
        .addPermission(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('新增权限成功')
            ElMessage.success('新增权限成功')
            onClose()
            emits('afterAdd', result.data.permission.id) // 调用父组件afterAdd事件
          } else {
            Logger.log('新增权限失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增权限失败')
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
