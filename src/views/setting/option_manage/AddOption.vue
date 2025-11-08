<template>
  <el-dialog top="5vh" draggable :model-value="props.show" title="新增参数" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right">
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" clearable filterable>
          <el-option v-for="item in Option.data.option.categoryList" :key="item.category" :value="item.category">
            <el-text>{{ item.label }}</el-text>
            <el-text type="info" style="margin-left: 2rem">{{ item.category }}</el-text>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item label="Key" prop="optionKey">
        <el-input v-model="form.optionKey" clearable />
      </el-form-item>
      <el-form-item label="当前值" prop="optionValue">
        <el-input v-model="form.optionValue" type="textarea" />
      </el-form-item>
      <el-form-item label="默认值" prop="defaultValue">
        <el-input v-model="form.defaultValue" type="textarea" />
      </el-form-item>
      <el-form-item label="前端加载" prop="frontLoad">
        <el-switch v-model="form.frontLoad" />
      </el-form-item>
      <el-form-item label="JS类型" prop="jsType" v-if="form.frontLoad">
        <el-select v-model="form.jsType" clearable filterable>
          <el-option value="STRING" label="字符串类型 - STRING" />
          <el-option value="NUMBER" label="数值类型 - NUMBER" />
          <el-option value="BOOLEAN" label="布尔类型 - BOOLEAN" />
          <el-option value="ARRAY" label="数组 - ARRAY" />
          <el-option value="OBJECT" label="对象 - OBJECT" />
        </el-select>
      </el-form-item>
      <el-form-item label="后台加载" prop="backLoad">
        <el-switch v-model="form.backLoad" />
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

const Api = useApiStore()
const Option = useOptionStore()

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
  category: [{ required: true, trigger: 'blur', message: '请选择参数分类' }],
  name: [{ required: true, trigger: 'blur', message: '请输入参数名称' }],
  optionKey: [{ required: true, trigger: 'blur', message: '请输入参数Key' }],
  optionValue: [{ required: true, trigger: 'blur', message: '请选择当前参数值' }],
  jsType: [{ required: true, trigger: 'blur', message: '请选择JS类型' }]
})
const form = ref({
  sortId: 1,
  category: null,
  optionKey: null,
  optionValue: null,
  defaultValue: null,
  name: null,
  description: null,
  backLoad: false,
  frontLoad: false,
  jsType: null
})

// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.sortId = 1
      form.value.category = null
      form.value.optionKey = null
      form.value.optionValue = null
      form.value.defaultValue = null
      form.value.name = null
      form.value.description = null
      form.value.backLoad = false
      form.value.frontLoad = false
      form.value.jsType = null
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  console.log('新增参数')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      await Api.request.common.option
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('新增参数成功')
            ElMessage.success('新增参数成功')
            onClose()
            emits('afterAdd', result.data.option) // 调用父组件afterAdd事件
          } else {
            console.log('新增参数失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增参数失败')
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
