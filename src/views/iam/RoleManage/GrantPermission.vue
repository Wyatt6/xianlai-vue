<template>
  <el-drawer :model-value="props.show" :title="title" size="80%" @close="onClose">
    <el-table
      ref="tableRef"
      size="small"
      height="100%"
      border
      row-key="id"
      :data="formList"
      :current-row-key="currRowKey"
      v-loading="loading"
      :row-style="rowColor"
    >
      <el-table-column type="selection" :selectable="selectable" align="center" width="40" />
      <el-table-column label="模块分组" align="center" prop="module" width="160" />
      <el-table-column label="权限标识" prop="identifier" />
      <el-table-column label="权限名称">
        <template #default="scope">
          <el-popover placement="left" effect="light" v-if="scope.row.remark && scope.row.remark.length > 0">
            <template #reference>
              <span style="cursor: default">{{ scope.row.name }}</span>
            </template>
            {{ scope.row.remark }}
          </el-popover>
          <span v-else style="cursor: default">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="70">
        <template #default="scope">
          <span v-if="scope.row.activated" style="color: #67c23a">
            {{ '生效' }}
          </span>
          <span v-else style="color: #f56c6c">
            {{ '未生效' }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div v-perm="[Perms.UPDATE_GRANTS]">
        <el-button v-if="!change" type="danger" plain @click="change = true">变更授权</el-button>
        <el-button v-if="change" type="primary" @click="onConfirm" :loading="saving">保存变更</el-button>
        <el-button v-if="change" @click="onCancel">取消变更</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import Perms from '@/plugins/directives/permissions'
import Apis from '@/apis'

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
const emits = defineEmits(['close'])

const title = ref('')
const change = ref(false)
// -----
const tableRef = ref()
const formList = ref([])
const permIdsOfRole = ref([])
const currRowKey = ref()
const loading = ref(false)

/**
 * 获取全量权限数据
 */
async function getPermissions() {
  return Apis.iam.permission
    .getPermissions()
    .then(res => {
      if (res && res.success) {
        console.log('成功获取权限列表')
        return res.data
      } else {
        console.log('获取权限列表失败')
        ElMessage.error(res && res.message ? res.message : '获取权限列表失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
}

/**
 * 查询某角色所具有的权限ID列表
 * @param id 角色ID
 */
async function getPermissionIdsOfRole(id) {
  return Apis.iam.permission
    .getPermissionIdsOfRole(id)
    .then(res => {
      if (res && res.success) {
        console.log('成功获取该角色的权限列表')
        return res.data
      } else {
        console.log('获取该角色的权限列表失败')
        ElMessage.error(res && res.message ? res.message : '获取该角色的权限列表失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
}

/**
 * 重置选中数据函数
 */
function resetSelected() {
  // 要先放开可勾选toggleRowSelection才能执行成功
  const oldChange = change.value
  change.value = true
  tableRef.value.clearSelection()
  for (let i = 0; i < formList.value.length; i++) {
    const row = formList.value[i]
    let select = false
    for (let j = 0; j < permIdsOfRole.value.length; j++) {
      if (permIdsOfRole.value[j] === row.id) {
        select = true
        break
      }
    }
    tableRef.value.toggleRowSelection(row, select)
  }
  change.value = oldChange
}

/**
 * 保存变更
 */
const saving = ref(false)
async function onConfirm() {
  console.groupCollapsed('保存授权的变更')
  saving.value = true

  const selectedRows = tableRef.value.getSelectionRows()
  console.log('获取要授权的权限ID列表')
  const grantList = []
  for (let i = 0; i < selectedRows.length; i++) {
    let notShow = true
    for (let j = 0; j < permIdsOfRole.value.length; j++) {
      if (selectedRows[i].id === permIdsOfRole.value[j]) {
        notShow = false
        break
      }
    }
    if (notShow) {
      grantList.push(selectedRows[i].id)
    }
  }
  console.log('获取要解除授权的权限ID列表')
  const cancelList = []
  for (let i = 0; i < permIdsOfRole.value.length; i++) {
    let notShow = true
    for (let j = 0; j < selectedRows.length; j++) {
      if (permIdsOfRole.value[i] === selectedRows[j].id) {
        notShow = false
        break
      }
    }
    if (notShow) {
      cancelList.push(permIdsOfRole.value[i])
    }
  }

  if (grantList.length + cancelList.length > 0) {
    await Apis.iam.role
      .updateGrants({
        roleId: props.nowRow.id,
        grant: grantList,
        cancel: cancelList
      })
      .then(async res => {
        if (res && res.success) {
          const { failGrant, failCancel } = res.data
          const failGrantCnt = failGrant ? failGrant.length : 0
          const failCancelCnt = failCancel ? failCancel.length : 0
          if (failGrantCnt + failCancelCnt > 0) {
            const grantSum = grantList.length
            const cancelSum = cancelList.length
            if (failGrantCnt + failCancelCnt < grantSum + cancelSum) {
              console.log('部分授权变更成功')
              ElMessage.error(`授权${grantSum - failGrantCnt}/${grantSum} 解除授权${cancelSum - failCancelCnt}/${cancelSum}`)
            } else {
              console.log('授权变更失败')
              ElMessage.error('授权变更失败')
            }
          } else {
            console.log('授权变更成功')
            ElMessage.success('授权变更成功')
          }
          console.log('更新角色所具有的授权')
          loading.value = true
          const { permissionIds } = await getPermissionIdsOfRole(props.nowRow.id)
          permIdsOfRole.value = permissionIds
          resetSelected()
          change.value = false
          loading.value = false
        } else {
          console.log('授权变更失败')
          ElMessage.error(res && res.message ? res.message : '授权变更失败')
        }
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })
  } else {
    console.log('授权未有变化')
    ElMessage.warning('授权未有变化')
  }

  saving.value = false
  console.groupEnd()
}

/**
 * 取消变更
 */
function onCancel() {
  resetSelected()
  change.value = false
}

/**
 * 是否可以勾选
 */
function selectable(row, index) {
  return change.value
}

/**
 * 不同行的状态颜色
 * @param param0 row-当前行；rowIndex-当前下标
 */
function rowColor({ row, rowIndex }) {
  // 是否为角色原有的权限
  let original = false
  for (let i = 0; i < permIdsOfRole.value.length; i++) {
    if (row.id === permIdsOfRole.value[i]) {
      original = true
      break
    }
  }

  // 是否已经勾选
  const selectedRows = tableRef.value.getSelectionRows()
  let rowSelected = false
  for (let i = 0; i < selectedRows.length; i++) {
    if (row.id === selectedRows[i].id) {
      rowSelected = true
      break
    }
  }

  // 1、原有的权限（已勾选）：蓝色
  if (original && rowSelected) {
    return {
      backgroundColor: '#ecf5ff'
    }
  }
  // 2、新增的权限（新勾选）：绿色
  if (!original && rowSelected) {
    return {
      backgroundColor: '#f0f9eb'
    }
  }
  // 3、删除的权限（取消勾选）：红色
  if (original && !rowSelected) {
    return {
      backgroundColor: '#fef0f0'
    }
  }
}

/**
 * 监听打开对话框动作
 * 初始化数据
 */
watch(
  () => props.show,
  async (value, oldValue) => {
    if (value) {
      title.value = '角色【' + props.nowRow.identifier + (props.nowRow.name ? ' / ' + props.nowRow.name : '') + '】的授权'
      change.value = false
      loading.value = true
      const { permissions } = await getPermissions()
      formList.value = permissions
      const { permissionIds } = await getPermissionIdsOfRole(props.nowRow.id)
      permIdsOfRole.value = permissionIds
      resetSelected()
      loading.value = false
    }
  },
  { immediate: true }
)

/**
 * 关闭对话框
 */
function onClose() {
  // 调用父组件close事件
  emits('close')
}
</script>
