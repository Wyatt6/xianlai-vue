<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="路径名称" prop="name">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="路径URl" prop="path">
        <el-input v-model="form.path" clearable />
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
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  name: [{ required: true, trigger: 'blur', message: '请输入路径名称' }],
  path: [{ required: true, trigger: 'blur', message: '请输入路径URL' }]
})
const form = ref({
  sortId: 1,
  name: null,
  path: null
})
// -----
const loading = ref(false)
// 表单参数初始化函数
const initForm = () => {
  title.value = '编辑路径【' + props.nowRow.name + '】'
  // 用当前路径数据渲染表单初始数据
  form.value.sortId = props.nowRow.sortId
  form.value.name = props.nowRow.name
  form.value.path = props.nowRow.path
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
  console.log('编辑路径')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      if (form.value.sortId === props.nowRow.sortId && form.value.name === props.nowRow.name && form.value.path === props.nowRow.path) {
        console.log('路径无修改')
        ElMessage.info('路径无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        sortId: form.value.sortId,
        name: form.value.name,
        path: form.value.path
      }
      await Api.request.common.path
        .edit(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('编辑路径成功')
            ElMessage.success('保存成功')
            onClose()
            emits('afterEdit', result.data.path) // 调用父组件afterEdit事件
          } else {
            console.log('编辑路径失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '编辑路径失败')
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
