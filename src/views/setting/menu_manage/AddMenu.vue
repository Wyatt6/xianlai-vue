<template>
  <el-dialog draggable :model-value="props.show" title="新增菜单" @close="onClose()">
    <el-form ref="formRef" :rules="formRules" :model="form" label-width="11rem" label-position="right">
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select v-model="form.parentId" :data="menuList" node-key="id" :props="{ label: 'title' }" check-strictly default-expand-all>
          <template #label="{ label, value }">
            <el-text type="info">(菜单ID: {{ value }})</el-text>
            <el-text style="margin-left: 1rem">{{ label }}</el-text>
          </template>
          <template #default="{ node, data }">
            <el-text type="info">(菜单ID: {{ data.id }})</el-text>
            <el-text style="margin-left: 1rem">{{ data.title }}</el-text>
          </template>
        </el-tree-select>
      </el-form-item>
      <el-form-item label="排序ID" prop="sortId">
        <el-input v-model="form.sortId" clearable />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-select v-model="form.icon" clearable filterable>
          <template #label="{ label, value }">
            <div class="option-icon-wrap">
              <el-icon v-if="value.includes('el-')" size="1.8rem">
                <component :is="value.substring(3, value.length)" />
              </el-icon>
              <LocalIcon v-else class="custom-icon" :name="value" size="1.8rem" />
              <span class="option-icon-title">{{ value }}</span>
            </div>
          </template>
          <el-option-group label="Remix图标">
            <el-option v-for="icon in remixIconList" :key="icon" :value="icon">
              <div class="option-icon-wrap">
                <LocalIcon class="custom-icon" :name="icon" size="1.8rem" />
                <span class="option-icon-title">{{ icon }}</span>
              </div>
            </el-option>
          </el-option-group>
          <el-option-group label="Element图标">
            <el-option v-for="icon in elementIconList" :key="icon" :value="icon">
              <div class="option-icon-wrap">
                <el-icon size="1.8rem">
                  <component :is="icon.substring(3, icon.length)" />
                </el-icon>
                <span class="option-icon-title">{{ icon }}</span>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item label="菜单标题" prop="title">
        <el-input v-model="form.title" clearable />
      </el-form-item>
      <el-form-item label="访问路径名称" prop="pathName">
        <el-select v-model="form.pathName" clearable filterable>
          <el-option v-for="path in props.paths" :key="path.id" :value="path.name">
            <el-text>{{ path.name }}</el-text>
            <el-text type="info" style="margin-left: 2rem">{{ path.path }}</el-text>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="非公开" prop="needPermission">
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
      <el-form-item label="立即生效" prop="active">
        <el-switch v-model="form.active" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="onConfirm()" :loading="loading">确定</el-button>
      <el-button @click="onClose()">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import LocalIcon from '@/components/LocalIcon/index.vue'
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
  menus: {
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
const menuList = ref([])

const loading = ref(false)
const formRef = ref()
const formRules = ref({
  sortId: [{ required: true, trigger: 'blur', message: '请输入排序ID' }],
  parentId: [{ required: true, trigger: 'blur', message: '请选择上级菜单' }],
  title: [{ required: true, trigger: 'blur', message: '请输入菜单标题' }],
  pathName: [{ required: true, trigger: 'blur', message: '请选择访问路径' }],
  permission: [{ required: true, trigger: 'blur', message: '请选择所需的权限' }]
})
const form = ref({
  sortId: 1,
  parentId: 0,
  icon: null,
  title: null,
  pathName: null,
  needPermission: false,
  permission: null,
  active: false
})
const elementIconList = ref([])
const remixIconList = ref([])

function initElementIcons() {
  elementIconList.value = []
  Object.entries(ElementPlusIconsVue).forEach(([key, valueObj]) => {
    const icon = 'el-' + key
    elementIconList.value.push(icon)
  })
}
initElementIcons()

function initRemixIcons() {
  remixIconList.value = []
  const icons = import.meta.glob('@/assets/icons/*.svg')
  Object.entries(icons).forEach(([key, valueObj]) => {
    const items = key.split('/')
    const icon = items[4].split('.')[0]
    remixIconList.value.push(icon)
  })
}
initRemixIcons()

// ----- 监听打开对话框动作 -----
watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      menuList.value = [{ id: 0, title: '根目录', children: props.menus }]
      // 初始化
      form.value.sortId = 1
      form.value.parentId = 0
      form.value.icon = null
      form.value.title = null
      form.value.pathName = null
      form.value.needPermission = false
      form.value.permission = null
      form.value.active = false
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 点击“确定”
 */
function onConfirm() {
  Logger.log('新增菜单')
  formRef.value.validate(async valid => {
    if (valid) {
      Logger.log('通过表单格式验证')
      loading.value = true
      await Api.request.common.menu
        .add(null, form.value)
        .finally(() => {
          loading.value = false
        })
        .then(result => {
          if (result && result.success) {
            Logger.log('新增菜单成功')
            ElMessage.success('新增菜单成功')
            onClose()
            emits('afterAdd', result.data.menu) // 调用父组件afterAdd事件
          } else {
            Logger.log('新增菜单失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '新增菜单失败')
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
