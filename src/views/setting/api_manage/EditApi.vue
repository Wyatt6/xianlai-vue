<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
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
      <el-form-item label="请求URl" prop="url">
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
const formRef = ref(null)
const formRules = ref({
  callPath: [{ required: true, trigger: 'blur', message: '请输入调用路径' }],
  requestMethod: [{ required: true, trigger: 'blur', message: '请输入请求方法' }],
  url: [{ required: true, trigger: 'blur', message: '请输入请求URL' }]
})
const form = ref({
  callPath: null,
  requestMethod: null,
  url: null,
  description: null
})
// -----
const loading = ref(false)
// 表单参数初始化函数
const initForm = () => {
  title.value = '编辑接口【' + props.nowRow.callPath + '】'
  // 用当前接口数据渲染表单初始数据
  form.value.callPath = props.nowRow.callPath
  form.value.requestMethod = props.nowRow.requestMethod
  form.value.url = props.nowRow.url
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
  Logger.log('编辑接口')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      if (
        form.value.callPath === props.nowRow.callPath &&
        form.value.requestMethod === props.nowRow.requestMethod &&
        form.value.url === props.nowRow.url &&
        form.value.description === props.nowRow.description
      ) {
        Logger.log('接口无修改')
        ElMessage.info('接口无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        callPath: form.value.callPath,
        requestMethod: form.value.requestMethod,
        url: form.value.url,
        description: form.value.description
      }
      await Api.request.common.api
        .edit(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('编辑接口成功')
            ElMessage.success('保存成功')
            onClose()
            emits('afterEdit', result.data.api) // 调用父组件afterEdit事件
          } else {
            Logger.log('编辑接口失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '编辑接口失败')
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
