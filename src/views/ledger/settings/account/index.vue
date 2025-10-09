<template>
  <div class="settings-wrapper">
    <el-button size="small" type="primary" :icon="Plus" @click="onAdd()">新增</el-button>
    <el-button size="small" type="success" :icon="Refresh" @click="refresh()">刷新</el-button>
    <div class="table-wrapper">
      <el-table height="100%" stripe v-loading="loading" row-key="id" highlight-current-row :current-row-key="currRowKey" :data="list">
        <el-table-column label="序号" align="center" width="100" type="index" />
        <el-table-column label="动账账户" prop="name" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.activated ? 'success' : 'danger'">
              {{ scope.row.activated ? '生效' : '未生效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300" fixed="right">
          <template #default="scope">
            <el-button-group size="small">
              <el-tooltip effect="dark" content="禁用" placement="top" v-if="scope.row.activated">
                <el-button :icon="Open" plain type="success" @click="onChangeStatus(scope.row)" />
              </el-tooltip>
              <el-tooltip effect="dark" content="激活" placement="top" v-else>
                <el-button :icon="TurnOff" plain type="danger" @click="onChangeStatus(scope.row)" />
              </el-tooltip>
              <el-button :icon="Edit" plain @click="onEdit(scope.row)" />
              <el-button :icon="Top" plain @click="moveUp(scope)" />
              <el-button :icon="Bottom" plain @click="moveDown(scope)" />
              <el-button :icon="Delete" type="danger" @click="onDelete(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Refresh, Open, TurnOff, Edit, Top, Bottom, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApiStore } from '@/apis'

const currRowKey = ref()
const loading = ref(false)

// ----- 获取列表 -----
const list = ref([])
const getAccounts = async () => {
  loading.value = true
  const { accounts } = await Api.request.ledger.account.getAccounts().then(res => {
    if (res && res.success) {
      console.log('成功获取动账账户列表')
      return res.data
    } else {
      console.log('获取动账账户列表失败')
      ElMessage.error(res && res.message ? res.message : '获取动账账户列表失败')
    }
  })
  list.value = accounts
  loading.value = false
}
getAccounts()

// ---------- 点击“新增” ----------
const onAdd = async id => {
  ElMessageBox.prompt('请输入动账账户名称：', '添加动账账户', { draggable: true })
    .then(async input => {
      const form = {}
      form.name = input.value
      form.activated = 1
      await Api.request.ledger.account.addAccount(form).then(async res => {
        if (res && res.success) {
          console.log('成功添加动账账户')
          ElMessage.success('添加成功')
          const { account } = res.data
          await getAccounts()
          // 选中最新增加的角色记录
          currRowKey.value = account.id
        } else {
          console.log('添加动账账户失败')
          ElMessage.error(res && res.message ? res.message : '添加失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 点击“刷新” -----
const refresh = async () => {
  await getAccounts()
  ElMessage.success('刷新完成')
}

// ----- 启用、禁用 -----
const onChangeStatus = item => {
  const title1 = '禁用动账账户'
  const title2 = '启用动账账户'
  const msg1 = '禁用动账账户不会影响已经登记的记账明细和资产盘点数据，但无法继续使用此动账账户登记新明细或盘点资产。请确认是否禁用？'
  const msg2 = '启用后可以继续使用此动账账户登记新记账明细和盘点资产。请确认是否启用？'
  ElMessageBox.confirm(item.activated ? msg1 : msg2, item.activated ? title1 : title2, { type: 'warning' })
    .then(() => {
      const input = {
        id: item.id,
        activated: !item.activated
      }
      Api.request.ledger.account.editAccount(input).then(res => {
        if (res && res.success) {
          console.log('成功更新动账账户数据')
          if (item.activated) {
            ElMessage.warning('成功禁用动账账户')
          } else {
            ElMessage.success('成功启用动账账户')
          }
          item.activated = !item.activated
        } else {
          console.log('更新动账账户失败')
          ElMessage.error(res && res.message ? res.message : '更新动账账户失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 编辑 -----
const onEdit = item => {
  ElMessageBox.confirm('执行修改操作会更改所有已经用此动账账户登记的记账明细和资产盘点数据。请确认是否修改？', '编辑动账账户', {
    type: 'warning'
  })
    .then(() => {
      ElMessageBox.prompt('动账账户名称：', '编辑动账账户', { draggable: true, inputValue: item.name })
        .then(input => {
          if (input.value === item.name) {
            ElMessage.warning('动账账户名称未修改')
            return
          }
          const form = {
            id: item.id,
            name: input.value
          }
          Api.request.ledger.account.editAccount(form).then(res => {
            if (res && res.success) {
              console.log('成功修改动账账户')
              ElMessage.success('修改成功')
              item.name = res.data.account.name
            } else {
              console.log('修改动账账户失败')
              ElMessage.error(res && res.message ? res.message : '修改失败')
            }
          })
        })
        .catch(() => {
          // 点击“取消”不做动作
        })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 上移、下移操作 -----
const swapPosition = (id1, id2) => {
  return Api.request.ledger.account.swapPosition(id1, id2).then(res => {
    if (res && res.success) {
      console.log('移动成功')
      return res.data
    } else {
      console.log(res.message)
      ElMessage.error('移动失败')
    }
  })
}
// 上移
const moveUp = async scope => {
  console.groupCollapsed('上移动账账户记录', 'index=', scope.$index)
  const index = scope.$index
  const row = scope.row
  if (index === 0) {
    ElMessage.error('已经是第1行，无法再上移')
    console.log('已经是第1行，无法再上移')
  } else {
    const id1 = row.id
    const id2 = list.value[index - 1].id
    console.log('id1=', id1, 'sortId_1=', row.sortId)
    console.log('id2=', id2, 'sortId_2=', list.value[index - 1].sortId)

    const { account1, account2 } = await swapPosition(id1, id2)
    if (account1 != null && account2 != null) {
      console.log('渲染表格')
      list.value[index].sortId = account1.sortId
      list.value[index - 1].sortId = account2.sortId

      const temp = list.value[index]
      list.value[index] = list.value[index - 1]
      list.value[index - 1] = temp

      currRowKey.value = row.id
      ElMessage.success('移动完成')
    }
  }
  console.groupEnd()
}
// 下移
const moveDown = async scope => {
  console.groupCollapsed('下移动账账户记录', 'index=', scope.$index)
  const index = scope.$index
  const row = scope.row
  if (index === list.value.length - 1) {
    ElMessage.error('已经是最后一行，无法再下移')
    console.log('已经是最后一行，无法再下移')
  } else {
    const id1 = row.id
    const id2 = list.value[index + 1].id
    console.log('id1=', id1, 'sortId_1=', row.sortId)
    console.log('id2=', id2, 'sortId_2=', list.value[index + 1].sortId)

    const { account1, account2 } = await swapPosition(id1, id2)
    if (account1 != null && account2 != null) {
      console.log('渲染表格')
      list.value[index].sortId = account1.sortId
      list.value[index + 1].sortId = account2.sortId

      const temp = list.value[index]
      list.value[index] = list.value[index + 1]
      list.value[index + 1] = temp

      currRowKey.value = row.id
      ElMessage.success('移动完成')
    }
  }
  console.groupEnd()
}

const onDelete = item => {
  ElMessageBox.confirm(
    '1. 此操作不会删除【记账明细】中“动账账户”列登记为本账户的明细条目，这些明细将会被移动到“<默认虚拟动账账户>”账户中；<br/>' +
      '2. 此操作不会删除【预算盘点】中“动账账户”登记为本账户的数据，这些数据将会被重新移动到“<默认虚拟动账账户>”账户中；<br/>' +
      '3. 删除操作不可恢复，请确认是否删除？',
    '删除动账账户',
    { type: 'warning', dangerouslyUseHTMLString: true }
  )
    .then(() => {
      Api.request.ledger.account.deleteAccount(item.id).then(res => {
        if (res && res.success) {
          console.log('成功删除动账账户')
          ElMessage.success('删除成功')
          getAccounts()
        } else {
          console.log('删除动账账户失败')
          ElMessage.error(res && res.message ? res.message : '删除失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}
</script>

<style lang="scss" scoped>
.settings-wrapper {
  width: calc(100% - 1.8rem);
  height: 100%;
  margin-left: 1.8rem;

  .table-wrapper {
    display: block;
    margin-top: 1rem;
    width: 100%;
    height: calc(100vh - 15.8rem);
  }
}
</style>
