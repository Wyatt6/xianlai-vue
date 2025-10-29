<template>
  <el-drawer :model-value="props.show" :title="title" size="80%" @close="onClose()">
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
      <el-table-column label="角色标识" prop="identifier" width="200" />
      <el-table-column label="角色名称" prop="name" width="200" />
      <el-table-column label="状态" align="center" width="55">
        <template #default="scope">
          <span v-if="scope.row.active" style="color: #67c23a">{{ '生效' }}</span>
          <span v-else style="color: #f56c6c">{{ '未生效' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色说明" prop="description" />
      <el-table-column label="用户绑定检查" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.bindCheck ? 'success' : 'danger'">
            {{ scope.row.bindCheck ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div v-perm="['user:bind']">
        <el-button v-if="!change" type="danger" plain :disabled="props.nowRow.isDelete" @click="change = true">变更绑定</el-button>
        <el-button v-if="change" type="primary" :disabled="props.nowRow.isDelete" @click="onConfirm()" :loading="saving">保存变更</el-button>
        <el-button v-if="change" @click="onCancel()">取消变更</el-button>
      </div>
    </template>
  </el-drawer>
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
 * 查询某用户所具有的角色ID列表
 * @param id 用户ID
 */
async function getRoleIdsOfUser(id) {
  return Api.request.iam.role.getRoleIdsOfUser({ userId: id }).then(result => {
    if (result && result.success) {
      Logger.log('成功获取该用户的角色列表')
      return result.data
    } else {
      Logger.log('获取该用户的角色列表失败')
      ElMessage.error(result && result.failMessage ? result.failMessage : '获取该用户的角色列表失败')
    }
  })
}

/**
 * 重置选中数据函数
 */
function resultetSelected() {
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
  Logger.log('保存角色绑定的变更')
  saving.value = true
  const selectedRows = tableRef.value.getSelectionRows()
  Logger.log('获取要绑定的角色ID列表')
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
  Logger.log('获取要解除绑定的角色ID列表')
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
    await Api.request.iam.user
      .bind(null, {
        userId: props.nowRow.id,
        bind: bindList,
        cancel: cancelList
      })
      .then(async result => {
        if (result && result.success) {
          const { failBind, failCancel } = result.data
          const failBindCnt = failBind ? failBind.length : 0
          const failCancelCnt = failCancel ? failCancel.length : 0
          if (failBindCnt + failCancelCnt > 0) {
            const bindSum = bindList.length
            const cancelSum = cancelList.length
            if (failBindCnt + failCancelCnt < bindSum + cancelSum) {
              Logger.log('部分绑定变更成功')
              ElMessage.error(`绑定${bindSum - failBindCnt}/${bindSum} 解除绑定${cancelSum - failCancelCnt}/${cancelSum}`)
            } else {
              Logger.log('绑定变更失败')
              ElMessage.error('绑定变更失败')
            }
          } else {
            Logger.log('绑定变更成功')
            ElMessage.success('绑定变更成功')
          }
          Logger.log('更新用户所绑定的角色')
          loading.value = true
          const { roleIds } = await getRoleIdsOfUser(props.nowRow.id)
          roleIdsOfUser.value = roleIds
          resultetSelected()
          change.value = false
          loading.value = false
        } else {
          Logger.log('绑定变更失败')
          ElMessage.error(result && result.failMessage ? result.failMessage : '绑定变更失败')
        }
      })
  } else {
    Logger.log('绑定未有变化')
    ElMessage.warning('绑定未有变化')
  }
  saving.value = false
}

/**
 * 取消变更
 */
function onCancel() {
  resultetSelected()
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
      await Api.request.iam.role
        .getPageConditionally({ pageNum: -1, pageSize: 0 }, null)
        .then(async result => {
          if (result && result.success) {
            Logger.log('成功获取角色列表')
            const { content } = result.data
            formList.value = content
            const { roleIds } = await getRoleIdsOfUser(props.nowRow.id)
            roleIdsOfUser.value = roleIds
            resultetSelected()
          } else {
            Logger.log('获取角色列表失败')
            ElMessage.error(result && result.failMessage ? result.failMmessage : '获取角色列表失败')
          }
        })
        .finally(() => {
          loading.value = false
        })
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
