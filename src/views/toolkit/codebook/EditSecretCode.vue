<template>
  <el-dialog draggable :model-value="props.show" :title="title" @close="onClose">
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
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  title: [{ required: true, trigger: 'blur', message: '请输入名称' }]
})
const form = ref({
  sortId: null,
  category: null,
  title: null,
  username: null,
  code: null,
  tips: null,
  address: null,
  twoFAS: null,
  appleId: null,
  wechat: null,
  alipay: null,
  phone: null,
  email: null,
  remark: null
})
// -----
const loading = ref(false)
/**
 * 表单参数初始化函数
 */
function initForm() {
  title.value = '编辑密码条目【' + (props.nowRow.category ? props.nowRow.category + ' / ' : '') + props.nowRow.title + '】'
  form.value.sortId = props.nowRow.sortId
  form.value.category = props.nowRow.category
  form.value.title = props.nowRow.title
  form.value.username = props.nowRow.username
  form.value.code = props.nowRow.code
  form.value.tips = props.nowRow.tips
  form.value.address = props.nowRow.address
  form.value.twoFAS = props.nowRow.twoFAS
  form.value.appleId = props.nowRow.appleId
  form.value.wechat = props.nowRow.wechat
  form.value.alipay = props.nowRow.alipay
  form.value.phone = props.nowRow.phone
  form.value.email = props.nowRow.email
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
  formRef.value.validate(async valid => {
    if (valid) {
      console.log('通过表单格式验证')
      loading.value = true
      if (
        form.value.sortId == props.nowRow.sortId &&
        form.value.category == props.nowRow.category &&
        form.value.title == props.nowRow.title &&
        form.value.username == props.nowRow.username &&
        form.value.code == props.nowRow.code &&
        form.value.tips == props.nowRow.tips &&
        form.value.address == props.nowRow.address &&
        form.value.twoFAS == props.nowRow.twoFAS &&
        form.value.appleId == props.nowRow.appleId &&
        form.value.wechat == props.nowRow.wechat &&
        form.value.alipay == props.nowRow.alipay &&
        form.value.phone == props.nowRow.phone &&
        form.value.email == props.nowRow.email &&
        form.value.remark == props.nowRow.remark
      ) {
        console.log('密码条目无修改')
        ElMessage.info('密码条目无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        sortId: form.value.sortId,
        category: form.value.category,
        title: form.value.title,
        username: form.value.username,
        code: form.value.code,
        tips: form.value.tips,
        address: form.value.address,
        twoFAS: form.value.twoFAS,
        appleId: form.value.appleId,
        wechat: form.value.wechat,
        alipay: form.value.alipay,
        phone: form.value.phone,
        email: form.value.email,
        remark: form.value.remark
      }
      await Api.request.toolkit.codebook
        .edit(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            console.log('修改密码条目成功')
            ElMessage.success('保存成功')
            onClose()
            emits('afterEdit', result.data.secretCode) // 调用父组件afterEdit事件
          } else {
            console.log('编辑密码条目失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '编辑密码条目失败')
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
