<template>
  <el-dialog draggable :model-value="props.show" title="新增角色" @close="onClose">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="角色标识" prop="identifier">
        <el-input v-model="form.identifier" clearable />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="是否立即生效">
        <el-switch v-model="form.activated" />
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
import Apis from '@/apis'

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
  activated: false,
  remark: null
})
// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.identifier = null
      form.value.name = null
      form.value.activated = false
      form.value.remark = null
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  console.groupCollapsed('新增角色')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      await Apis.iam.role
        .addRole(form.value)
        .then(res => {
          if (res && res.success) {
            console.log('新增角色成功')
            ElMessage.success('新增角色成功')
            loading.value = false
            onClose()
            emits('afterAdd', res.data.role.id) // 调用父组件afterAdd事件
          } else {
            console.log('新增角色失败')
            ElMessage.error(res && res.message ? res.message : '新增角色失败')
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
