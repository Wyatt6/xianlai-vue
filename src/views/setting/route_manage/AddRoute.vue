<template>
  <el-dialog top="5vh" draggable :model-value="props.show" title="新增路由" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="18rem" label-position="right">
      <el-form-item label="上级路由" prop="parentId">
        <el-tree-select v-model="form.parentId" :data="routeList" node-key="id" :props="{ label: 'name' }" check-strictly default-expand-all>
          <template #label="{ label, value }">
            <el-text type="info">(路由ID: {{ value }})</el-text>
            <el-text style="margin-left: 1rem">{{ label }}</el-text>
          </template>
          <template #default="{ node, data }">
            <el-text type="info">(路由ID: {{ data.id }})</el-text>
            <el-text style="margin-left: 1rem">{{ data.name }}</el-text>
          </template>
        </el-tree-select>
      </el-form-item>
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="路由名称(name)" prop="name">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="路由路径(path)" prop="pathName">
        <el-select v-model="form.pathName" clearable filterable>
          <el-option v-for="path in props.paths" :key="path.id" :value="path.name">
            <el-text>{{ path.name }}</el-text>
            <el-text type="info" style="margin-left: 2rem">{{ path.path }}</el-text>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="路由重定向(redirect)" prop="redirectPathName">
        <el-select v-model="form.redirectPathName" clearable filterable>
          <el-option v-for="path in props.paths" :key="path.id" :value="path.name">
            <el-text>{{ path.name }}</el-text>
            <el-text type="info" style="margin-left: 2rem">{{ path.path }}</el-text>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="组件相对路径(component)" prop="componentPath">
        <el-input v-model="form.componentPath" type="textarea" />
      </el-form-item>
      <el-form-item label="需登陆" prop="needLogin">
        <el-switch v-model="form.needLogin" />
      </el-form-item>
      <el-form-item label="需权限" prop="needPermission">
        <el-switch v-model="form.needPermission" />
      </el-form-item>
      <el-form-item label="所需权限标识" prop="permission" v-if="form.needPermission">
        <el-select v-model="form.permission" clearable filterable>
          <el-option v-for="perm in props.perms" :key="perm.id" :value="perm.identifier">
            <el-text>{{ perm.identifier }}</el-text>
            <el-text type="info" style="margin-left: 2rem">{{ perm.name }}</el-text>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="显示为标签" prop="showTag">
        <el-switch v-model="form.showTag" />
      </el-form-item>
      <el-form-item label="显示标签标题" prop="tagTitle" v-if="form.showTag">
        <el-input v-model="form.tagTitle" />
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
import Logger from '@/utils/logger'

const Api = useApiStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  },
  routes: {
    type: Array,
    default: [],
    required: true
  },
  paths: {
    type: Array,
    default: [],
    required: true
  },
  perms: {
    type: Array,
    default: [],
    required: true
  }
})
const emits = defineEmits(['close', 'afterAdd'])
const routeList = ref([])

const loading = ref(false)
const formRef = ref()
const formRules = ref({
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  parentId: [{ required: true, trigger: 'blur', message: '请选择上级路由' }],
  name: [{ required: true, trigger: 'blur', message: '请输入路由标题' }],
  pathName: [{ required: true, trigger: 'blur', message: '请选择路由路径' }]
})
const form = ref({
  sortId: 1,
  parentId: 0,
  name: null,
  pathName: null,
  redirectPathName: null,
  componentPath: null,
  needLogin: true,
  needPermission: true,
  permission: null,
  showTag: false,
  tagTitle: null
})

// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      routeList.value = [{ id: 0, title: '根目录', children: props.routes }]
      // 初始化
      form.value.sortId = 1
      form.value.parentId = 0
      form.value.name = null
      form.value.pathName = null
      form.value.redirectPathName = null
      form.value.componentPath = null
      form.value.needLogin = true
      form.value.needPermission = true
      form.value.permission = null
      form.value.showTag = false
      form.value.tagTitle = null
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  Logger.log('新增路由')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      await Api.request.common.route
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('新增路由成功')
            ElMessage.success('新增路由成功')
            onClose()
            emits('afterAdd', result.data.route) // 调用父组件afterAdd事件
          } else {
            Logger.log('新增路由失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增路由失败')
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

<style lang="scss" scoped>
.option-icon-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  .option-icon-title {
    margin-left: 1rem;
  }
}
</style>
