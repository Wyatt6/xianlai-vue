<template>
  <el-dialog draggable :model-value="props.show" title="新增密码条目" @close="onClose()">
    <el-scrollbar height="46rem">
      <el-form ref="formRef" :rules="formRules" :model="form" label-width="10rem" label-position="right" style="width: 95%">
        <el-form-item label="分组" prop="category">
          <el-input v-model="form.category" clearable />
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" clearable />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" clearable />
        </el-form-item>
        <el-form-item label="加密密码" prop="code">
          <el-input v-model="form.code" clearable />
        </el-form-item>
        <el-form-item label="密钥提示" prop="tips">
          <el-input v-model="form.tips" clearable />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="textarea" :rows="2" v-model="form.address" clearable />
        </el-form-item>
        <el-form-item label="双因子">
          <el-switch v-model="form.twoFAS" />
        </el-form-item>
        <el-form-item label="关联AppleID">
          <el-switch v-model="form.appleId" />
        </el-form-item>
        <el-form-item label="关联微信">
          <el-switch v-model="form.wechat" />
        </el-form-item>
        <el-form-item label="关联支付宝">
          <el-switch v-model="form.alipay" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" clearable />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" clearable />
        </el-form-item>
        <el-form-item label="排序ID" prop="sortId">
          <el-input v-model="form.sortId" clearable />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" v-model="form.remark" clearable />
        </el-form-item>
      </el-form>
    </el-scrollbar>
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
const formRef = ref(null)
const formRules = ref({
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  title: [{ required: true, trigger: 'blur', message: '请输入名称' }]
})
const form = ref({
  sortId: 1,
  category: null,
  title: null,
  username: null,
  code: null,
  tips: null,
  address: null,
  twoFAS: false,
  appleId: false,
  wechat: false,
  alipay: false,
  phone: null,
  email: null,
  remark: null
})
// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      form.value.sortId = 1
      form.value.category = null
      form.value.title = null
      form.value.username = null
      form.value.code = null
      form.value.tips = null
      form.value.address = null
      form.value.twoFAS = false
      form.value.appleId = false
      form.value.wechat = false
      form.value.alipay = false
      form.value.phone = null
      form.value.email = null
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
  console.log('新增密码条目')
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      await Api.request.toolkit.codebook
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('新增密码条目成功')
            ElMessage.success('新增密码条目成功')
            onClose()
            emits('afterAdd', result.data.secretCode, result.data.rowNum) // 调用父组件afterAdd事件
          } else {
            console.log('新增密码条目失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增密码条目失败')
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
