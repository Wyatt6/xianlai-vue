<template>
  <el-drawer :model-value="props.show" :title="title" size="70%" @close="onClose">
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
      <el-table-column type="selection" :selectable="selectable" align="center" width="50" />
      <el-table-column label="角色标识" prop="identifier" />
      <el-table-column label="角色名称">
        <template #default="scope">
          <el-popover placement="left" effect="light" v-if="scope.row.remark && scope.row.remark.length > 0">
            <template #reference
              ><span style="cursor: default">{{ scope.row.name }}</span></template
            >
            {{ scope.row.remark }}
          </el-popover>
          <span v-else style="cursor: default">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
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
      <div v-perm="[Perms.UPDATE_BINDS]">
        <el-button v-if="!change" type="danger" plain @click="change = true">变更绑定</el-button>
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
const roleIdsOfUser = ref([])
const currRowKey = ref()
const loading = ref(false)

/**
 * 获取全量角色列表
 */
async function getRoles() {
  return Apis.iam.role
    .getRoles()
    .then(res => {
      if (res && res.success) {
        console.log('成功获取角色列表')
        return res.data
      } else {
        console.log('获取角色列表失败')
        ElMessage.error(res && res.message ? res.message : '获取角色列表失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
}

/**
 * 查询某用户所具有的角色ID列表
 * @param id 用户ID
 */
async function getRoleIdsOfUser(id) {
  return Apis.iam.role
    .getRoleIdsOfUser(id)
    .then(res => {
      if (res && res.success) {
        console.log('成功获取该用户的角色列表')
        return res.data
      } else {
        console.log('获取该用户的角色列表失败')
        ElMessage.error(res && res.message ? res.message : '获取该用户的角色列表失败')
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
    for (let j = 0; j < roleIdsOfUser.value.length; j++) {
      if (roleIdsOfUser.value[j] === row.id) {
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
  console.groupCollapsed('保存角色绑定的变更')
  saving.value = true

  const selectedRows = tableRef.value.getSelectionRows()
  console.log('获取要绑定的角色ID列表')
  const bindList = []
  for (let i = 0; i < selectedRows.length; i++) {
    let notShow = true
    for (let j = 0; j < roleIdsOfUser.value.length; j++) {
      if (selectedRows[i].id === roleIdsOfUser.value[j]) {
        notShow = false
        break
      }
    }
    if (notShow) {
      bindList.push(selectedRows[i].id)
    }
  }
  console.log('获取要解除绑定的角色ID列表')
  const cancelList = []
  for (let i = 0; i < roleIdsOfUser.value.length; i++) {
    let notShow = true
    for (let j = 0; j < selectedRows.length; j++) {
      if (roleIdsOfUser.value[i] === selectedRows[j].id) {
        notShow = false
        break
      }
    }
    if (notShow) {
      cancelList.push(roleIdsOfUser.value[i])
    }
  }

  if (bindList.length + cancelList.length > 0) {
    await Apis.iam.user
      .updateBinds({
        userId: props.nowRow.id,
        bind: bindList,
        cancel: cancelList
      })
      .then(async res => {
        if (res && res.success) {
          const { failBind, failCancel } = res.data
          const failBindCnt = failBind ? failBind.length : 0
          const failCancelCnt = failCancel ? failCancel.length : 0
          if (failBindCnt + failCancelCnt > 0) {
            const bindSum = bindList.length
            const cancelSum = cancelList.length
            if (failBindCnt + failCancelCnt < bindSum + cancelSum) {
              console.log('部分绑定变更成功')
              ElMessage.error(`绑定${bindSum - failBindCnt}/${bindSum} 解除绑定${cancelSum - failCancelCnt}/${cancelSum}`)
            } else {
              console.log('绑定变更失败')
              ElMessage.error('绑定变更失败')
            }
          } else {
            console.log('绑定变更成功')
            ElMessage.success('绑定变更成功')
          }
          console.log('更新用户所绑定的角色')
          loading.value = true
          const { roleIds } = await getRoleIdsOfUser(props.nowRow.id)
          roleIdsOfUser.value = roleIds
          resetSelected()
          change.value = false
          loading.value = false
        } else {
          console.log('绑定变更失败')
          ElMessage.error(res && res.message ? res.message : '绑定变更失败')
        }
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })
  } else {
    console.log('绑定未有变化')
    ElMessage.warning('绑定未有变化')
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
  for (let i = 0; i < roleIdsOfUser.value.length; i++) {
    if (row.id === roleIdsOfUser.value[i]) {
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
 * 初始化
 */
watch(
  () => props.show,
  async (value, oldValue) => {
    if (value) {
      title.value = `用户【${props.nowRow.username}】绑定的角色`
      change.value = false
      loading.value = true
      const { roles } = await getRoles()
      formList.value = roles
      const { roleIds } = await getRoleIdsOfUser(props.nowRow.id)
      roleIdsOfUser.value = roleIds
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
