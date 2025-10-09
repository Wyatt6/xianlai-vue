<template>
  <div class="settings-wrapper">
    <el-button size="small" type="primary" :icon="Plus" @click="onAdd('root')">新增</el-button>
    <el-button size="small" type="success" :icon="Refresh" @click="refresh()">刷新</el-button>
    <div class="table-wrapper">
      <el-table :data="tree" height="100%" stripe row-key="id" highlight-current-row :current-row-key="currRowKey" v-loading="loading">
        <el-table-column label="记账类别">
          <template #default="scope">
            {{ scope.row.data.name }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.data.activated ? 'success' : 'danger'">
              {{ scope.row.data.activated ? '生效' : '未生效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300" fixed="right">
          <template #default="scope">
            <el-button-group size="small">
              <el-tooltip effect="dark" content="禁用" placement="top" v-if="scope.row.data.activated">
                <el-button :icon="Open" plain type="success" @click="onChangeStatus(scope.row.data)" />
              </el-tooltip>
              <el-tooltip effect="dark" content="激活" placement="top" v-else>
                <el-button :icon="TurnOff" plain type="danger" @click="onChangeStatus(scope.row.data)" />
              </el-tooltip>
              <el-tooltip effect="dark" content="新增子类别" placement="top">
                <el-button :icon="Plus" plain @click="onAdd('sub', scope.row.data.id)" />
              </el-tooltip>
              <el-button :icon="Edit" plain @click="onEdit(scope.row.data)" />
              <el-tooltip effect="dark" content="移动到" placement="top">
                <el-button :icon="Rank" plain @click="onChangeParent(scope.row.data)" />
              </el-tooltip>
              <el-button :icon="Top" plain @click="onMove(scope.row.data.id, 'up')" />
              <el-button :icon="Bottom" plain @click="onMove(scope.row.data.id, 'down')" />
              <el-button :icon="Delete" type="danger" @click="onDelete(scope.row.data)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <ChangeParent :show="showChangeParent" :nowRow="nowRow" :tree="tree" @close="showChangeParent = false" @after="getCategoryTree()" />
  </div>
</template>

<script setup>
import ChangeParent from './ChangeParent.vue'
import { ref } from 'vue'
import { Plus, Refresh, Open, TurnOff, Edit, Rank, Top, Bottom, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Apis from '@/apis'

const currRowKey = ref()
const loading = ref(false)

// ----- 获取分类树 -----
const tree = ref([])
const getCategoryTree = async () => {
  loading.value = true
  const { categoryTree } = await Apis.ledger.category.getCategoryTree().then(res => {
    if (res && res.success) {
      console.log('成功获取类别树')
      return res.data
    } else {
      console.log('获取类别树失败')
      ElMessage.error(res && res.message ? res.message : '获取类别树失败')
    }
  })
  tree.value = categoryTree
  loading.value = false
}
getCategoryTree()

// ----- 移动到某个类别下 -----
const showChangeParent = ref(false)
const nowRow = ref({})
const onChangeParent = item => {
  showChangeParent.value = true
  nowRow.value = item
}

// ----- 上移、下移操作 -----
const onMove = (id, mode) => {
  console.groupCollapsed('移动记账类别', 'id=', id, 'mode=', mode)
  Apis.ledger.category.moveOneRow(id, mode).then(res => {
    if (res && res.success) {
      console.log('成功移动记账类别')
      ElMessage.success('移动完成')
      getCategoryTree()
    } else {
      console.log('移动失败')
      ElMessage.error(res && res.message ? res.message : '移动失败')
    }
  })
  console.groupEnd()
}

// ----- 删除 -----
const onDelete = item => {
  ElMessageBox.confirm(
    '1. 此操作不会删除【记账明细】中“记账类别”列登记为本类别及其下的所有子类别的明细条目，这些明细将会被重新归类到“<未分类>”类别中；<br/>' +
      '2. 此操作不会删除【预算管理】中“记账类别”登记为本类别及其下的所有子类别的数据，这些数据将会被重新归类到“<未分类>”类别中；<br/>' +
      '3. 此操作将删除本记账类别及其下的所有子类别，并且删除操作不可恢复，请确认是否删除？',
    '删除记账类别',
    { type: 'warning', dangerouslyUseHTMLString: true }
  )
    .then(() => {
      Apis.ledger.category.deleteCategoryTree(item.id).then(res => {
        if (res && res.success) {
          console.log('成功删除记账类别及其子类别')
          ElMessage.success('删除成功')
          getCategoryTree()
        } else {
          console.log('删除记账类别失败')
          ElMessage.error(res && res.message ? res.message : '删除失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 编辑 -----
const onEdit = item => {
  ElMessageBox.confirm('执行修改操作会更改所有已经用此记账类别登记的记账明细和预算管理数据。请确认是否修改？', '编辑记账类别', {
    type: 'warning'
  })
    .then(() => {
      ElMessageBox.prompt('记账类别名称：', '编辑记账类别', { draggable: true, inputValue: item.name })
        .then(input => {
          if (input.value === item.name) {
            ElMessage.warning('记账类别名称未修改')
            return
          }
          const form = {
            id: item.id,
            name: input.value
          }
          Apis.ledger.category.editCategory(form).then(res => {
            if (res && res.success) {
              console.log('成功修改记账类别')
              ElMessage.success('修改成功')
              item.name = res.data.category.name
            } else {
              console.log('修改记账类别失败')
              ElMessage.error(res && res.message ? res.message : '修改记账类别失败')
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

// ----- 启用、禁用 -----
const onChangeStatus = item => {
  const title1 = '禁用记账类别'
  const title2 = '启用记账类别'
  const msg1 =
    '禁用记账类别不会影响已经登记的记账明细和预算管理数据，但无法继续使用被禁用类别及其所有子类别登记新明细或管理预算。请确认是否禁用此类别及其所有子类别？'
  const msg2 = '启用后可以继续使用此记账类别及其所有子类别登记新记账明细和管理预算。请确认是否启用此类别及其所有子类别？'
  ElMessageBox.confirm(item.activated ? msg1 : msg2, item.activated ? title1 : title2, { type: 'warning' })
    .then(() => {
      Apis.ledger.category.changeActivated(item.id, !item.activated).then(res => {
        if (res && res.success) {
          console.log('成功更新记账类别数据')
          if (item.activated) {
            ElMessage.warning('成功禁用记账类别及其子类别')
          } else {
            ElMessage.success('成功启用记账类别及其子类别')
          }
          getCategoryTree()
        } else {
          console.log('更新记账类别失败')
          ElMessage.error(res && res.message ? res.message : '更新记账类别失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 新增类别 -----
const onAdd = (mode, parentId) => {
  let title
  if (mode === 'root') title = '新增根类别'
  if (mode === 'sub') title = '新增子类别'
  ElMessageBox.prompt('请输入记账类别名称：', title, { draggable: true })
    .then(async input => {
      if (input.value.trim().length === 0) {
        ElMessage.error('记账类别名称不能为空')
        return
      }

      const addForm = {
        name: input.value,
        activated: true
      }
      if (mode === 'sub') addForm.parentId = parentId

      await Apis.ledger.category.addCategory(addForm).then(async res => {
        if (res && res.success) {
          ElMessage.success('新增成功')
          await getCategoryTree()
          // 高亮新增行
          currRowKey.value = res.data.category.id
        } else {
          console.log('新增类别树失败')
          ElMessage.error(res && res.message ? res.message : '新增类别树失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

// ----- 点击“刷新” -----
const refresh = async () => {
  await getCategoryTree()
  ElMessage.success('刷新完成')
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
