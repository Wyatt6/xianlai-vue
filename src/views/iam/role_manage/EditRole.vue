<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="10rem" label-position="right">
      <el-form-item label="角色标识" prop="identifier">
        <el-input v-model="form.identifier" clearable />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm" :loading="loading">确定</el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useApiStore } from '@/apis'

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

// ----- 初始化 -----
const title = ref('')
// -----
const formRef = ref(null)
const formRules = ref({
  identifier: [
    {
      required: true,
      trigger: 'blur', // 移开光标时
      message: '请输入角色标识符'
    }
  ]
})
const form = ref({
  identifier: null,
  name: null,
  remark: null
})
// -----
const loading = ref(false)
/**
 * 表单参数初始化函数
 */
function initForm() {
  title.value = '编辑角色【' + props.nowRow.identifier + (props.nowRow.name ? ' / ' + props.nowRow.name : '') + '】'
  // 用当前角色数据渲染表单初始数据
  form.value.identifier = props.nowRow.identifier
  form.value.name = props.nowRow.name
  form.value.remark = props.nowRow.remark
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
  console.groupCollapsed('编辑角色')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      if (form.value.identifier === props.nowRow.identifier && form.value.name === props.nowRow.name && form.value.remark === props.nowRow.remark) {
        console.log('角色无修改')
        console.groupEnd()
        ElMessage.info('角色无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        identifier: form.value.identifier,
        name: form.value.name,
        remark: form.value.remark
      }
      await Api.request.iam.role
        .editRole(input)
        .then(res => {
          if (res && res.success) {
            console.log('修改角色成功')
            ElMessage.success('保存成功')
            loading.value = false
            onClose()
            emits('afterEdit', res.data.role) // 调用父组件afterEdit事件
          } else {
            console.log('编辑角色失败')
            ElMessage.error(res && res.message ? res.message : '编辑角色失败')
          }
        })
        .catch(error => {
          // 异常已统一处理，此处忽略异常
        })
      loading.value = false
    }
  })
  console.groupEnd()
}

/**
 * 点击“取消”或关闭对话框
 */
function onClose() {
  // 调用父组件close事件
  emits('close')
}
</script>
