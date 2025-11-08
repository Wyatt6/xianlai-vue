<template>
  <el-dialog top="5vh" draggable :model-value="props.show" :title="title" @close="onClose">
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
      <el-form-item label="缓存组件" prop="keepAlive">
        <el-switch v-model="form.keepAlive" />
      </el-form-item>
      <el-form-item label="需要登陆" prop="needLogin">
        <el-switch v-model="form.needLogin" />
      </el-form-item>
      <el-form-item label="需要权限" prop="needPermission">
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
const emits = defineEmits(['close', 'afterEdit'])
const routeList = ref([])

// ----- 初始化 -----
const title = ref('')
const formRef = ref(null)
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
  keepAlive: true,
  needLogin: true,
  needPermission: true,
  permission: null,
  showTag: false,
  tagTitle: null
})

// -----
const loading = ref(false)
// 表单参数初始化函数
const initForm = () => {
  title.value = '编辑路由【' + props.nowRow.title + ' (路由ID: ' + props.nowRow.id + ')】'
  routeList.value = [{ id: 0, title: '根目录', children: props.routes }]
  // 用当前路由数据渲染表单初始数据
  form.value.sortId = props.nowRow.sortId
  form.value.parentId = props.nowRow.parentId
  form.value.name = props.nowRow.name
  form.value.pathName = props.nowRow.pathName
  form.value.redirectPathName = props.nowRow.redirectPathName
  form.value.componentPath = props.nowRow.componentPath
  form.value.keepAlive = props.nowRow.keepAlive
  form.value.needLogin = props.nowRow.needLogin
  form.value.needPermission = props.nowRow.needPermission
  form.value.permission = props.nowRow.permission
  form.value.showTag = props.nowRow.showTag
  form.value.tagTitle = props.nowRow.tagTitle
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
  Logger.log('编辑路由')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      if (
        form.value.sortId == props.nowRow.sortId &&
        form.value.parentId == props.nowRow.parentId &&
        form.value.name == props.nowRow.name &&
        form.value.pathName == props.nowRow.pathName &&
        form.value.redirectPathName == props.nowRow.redirectPathName &&
        form.value.componentPath == props.nowRow.componentPath &&
        form.value.keepAlive == props.nowRow.keepAlive &&
        form.value.needLogin == props.nowRow.needLogin &&
        form.value.needPermission == props.nowRow.needPermission &&
        form.value.permission == props.nowRow.permission &&
        form.value.showTag == props.nowRow.showTag &&
        form.value.tagTitle == props.nowRow.tagTitle
      ) {
        Logger.log('路由无修改')
        ElMessage.info('路由无修改')
        loading.value = false
        return
      }
      const input = {
        id: props.nowRow.id,
        sortId: form.value.sortId,
        parentId: form.value.parentId,
        name: form.value.name,
        pathName: form.value.pathName,
        redirectPathName: form.value.redirectPathName,
        componentPath: form.value.componentPath,
        keepAlive: form.value.keepAlive,
        needLogin: form.value.needLogin,
        needPermission: form.value.needPermission,
        permission: form.value.permission,
        showTag: form.value.showTag,
        tagTitle: form.value.tagTitle
      }
      await Api.request.common.route
        .edit(null, input)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('编辑路由成功')
            ElMessage.success('保存成功')
            onClose()
            emits('afterEdit', result.data.route) // 调用父组件afterEdit事件
          } else {
            Logger.log('编辑路由失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '编辑路由失败')
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
