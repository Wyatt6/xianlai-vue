<template>
  <el-dialog draggable :model-value="props.show" title="新增接口" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="调用路径" prop="callPath">
        <el-input v-model="form.callPath" clearable />
      </el-form-item>
      <el-form-item label="请求方法" prop="requestMethod">
        <el-select v-model="form.requestMethod" clearable>
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求URL" prop="url">
        <el-input v-model="form.url" clearable />
      </el-form-item>
      <el-form-item label="接口说明" prop="description">
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
  callPath: [{ required: true, trigger: 'blur', message: '请输入调用路径' }],
  requestMethod: [{ required: true, trigger: 'blur', message: '请输入请求方法' }],
  url: [{ required: true, trigger: 'blur', message: '请输入接口URL' }]
})
const form = ref({
  callPath: null,
  requestMethod: null,
  url: null,
  description: null
})
// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.callPath = null
      form.value.requestMethod = null
      form.value.url = null
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
  console.log('新增接口')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      await Api.request.common.api
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('新增接口成功')
            ElMessage.success('新增接口成功')
            onClose()
            emits('afterAdd', result.data.api, result.data.rowNum) // 调用父组件afterAdd事件
          } else {
            console.log('新增接口失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增接口失败')
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
