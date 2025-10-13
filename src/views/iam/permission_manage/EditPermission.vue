<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
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
      <el-form-item label="权限描述">
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
import Logger from '@/utils/logger'
import { useApiStore } from '@/apis'

const Api = useApiStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  },
  nowRow: {
    type: Object,
    required: true
  }
})
const emits = defineEmits(['close', 'afterEdit'])

// ----- 初始化 -----
const title = ref('')
// -----
const formRef = ref(null)
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
// -----
const loading = ref(false)
// 表单参数初始化函数
const initForm = () => {
  title.value = '编辑权限【' + props.nowRow.identifier + (props.nowRow.name ? ' / ' + props.nowRow.name : '') + '】'
  // 用当前权限数据渲染表单初始数据
  form.value.sortId = props.nowRow.sortId
  form.value.identifier = props.nowRow.identifier
  form.value.name = props.nowRow.name
  form.value.description = props.nowRow.description
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

// ----- 点击“确定” -----
const onConfirm = () => {
  Logger.log('编辑权限')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      if (
        form.value.sortId === props.nowRow.sortId &&
        form.value.identifier === props.nowRow.identifier &&
        form.value.name === props.nowRow.name &&
        form.value.description === props.nowRow.description
      ) {
        Logger.log('权限无修改')
        ElMessage.info('权限无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        identifier: form.value.identifier,
        name: form.value.name,
        description: form.value.description,
        sortId: form.value.sortId
      }
      await Api.request.iam.permission
        .editPermission(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('修改权限成功')
            ElMessage.success('保存成功')
            onClose()
            emits('afterEdit', result.data.permission) // 调用父组件afterEdit事件
          } else {
            Logger.log('编辑权限失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '编辑权限失败')
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
