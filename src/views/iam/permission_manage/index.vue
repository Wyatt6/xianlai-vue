<template>
  <div class="page-wrapper">
    <el-scrollbar class="scrollbar-wrapper">
      <div class="card-wrapper">
        <el-card class="card" shadow="never">
          <el-button size="small" type="primary" :icon="Plus" v-perm="[Perms.PERMISSION_ADD]" @click="showAddPermission = true"> 新增 </el-button>
          <el-button size="small" type="success" :icon="Refresh" @click="refresh"> 刷新 </el-button>
          <el-form
            class="search-box-inline"
            :inline="true"
            size="small"
            label-position="right"
            label-width="6rem"
            ref="searchFormRef"
            :model="searchForm"
          >
            <el-form-item label="模块分组" prop="module">
              <el-input v-model="searchForm.module" clearable />
            </el-form-item>
            <el-form-item label="权限标识" prop="identifier">
              <el-input v-model="searchForm.identifier" clearable />
            </el-form-item>
            <el-form-item label="权限名称" prop="name">
              <el-input v-model="searchForm.name" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="activated">
              <el-select v-model="searchForm.activated" clearable>
                <el-option label="生效" value="true" />
                <el-option label="未生效" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="timeRange">
              <el-date-picker
                v-model="searchForm.timeRange"
                type="datetimerange"
                start-placeholder="开始时间（含）"
                end-placeholder="结束时间（含）"
              />
            </el-form-item>
            <el-form-item>
              <el-button :icon="Search" @click="getList(1, formPageSize)">搜索</el-button>
              <el-button :icon="Brush" @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
          <div class="table-wrapper">
            <el-table
              height="100%"
              stripe
              row-key="id"
              :row-style="tableRow"
              highlight-current-row
              :data="formList"
              :current-row-key="currRowKey"
              v-loading="loading"
            >
              <el-table-column label="序号" align="center" width="70" type="index" :index="getIndex" />
              <el-table-column label="模块分组" align="center" prop="module" width="150" />
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
              <el-table-column label="状态" align="center" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.activated ? 'success' : 'danger'">
                    {{ scope.row.activated ? '生效' : '未生效' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" align="center" width="155">
                <template #default="scope">
                  {{ new Date(scope.row.createTime).toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="140" fixed="right" v-perm="[Perms.PERMISSION_EDIT, Perms.PERMISSION_DELETE]">
                <template #default="scope">
                  <el-button-group size="small">
                    <el-tooltip effect="dark" content="禁用" placement="top" v-if="scope.row.activated">
                      <el-button v-perm="[Perms.PERMISSION_EDIT]" :icon="Open" plain type="success" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
                    <el-tooltip effect="dark" content="激活" placement="top" v-else>
                      <el-button v-perm="[Perms.PERMISSION_EDIT]" :icon="TurnOff" plain type="danger" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
                    <el-button v-perm="[Perms.PERMISSION_EDIT]" :icon="Edit" plain @click="onEdit(scope.row)" />
                    <el-button v-perm="[Perms.PERMISSION_DELETE]" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-wrapper">
            <el-pagination
              size="small"
              layout="total, sizes, prev, pager, next, jumper"
              :total="formTotalElements"
              :page-sizes="pageSizeList"
              v-model:page-size="formPageSize"
              @size-change="onSizeChange"
              background
              v-model:current-page="formPageNum"
              @current-change="getList(formPageNum, formPageSize)"
            />
          </div>
        </el-card>
      </div>
    </el-scrollbar>
    <AddPermission :show="showAddPermission" @close="showAddPermission = false" @afterAdd="afterAdd" />
    <EditPermission :show="showEditPermission" :nowRow="nowRow" @close="showEditPermission = false" @afterEdit="afterEdit" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Brush, Open, TurnOff, Edit, Delete } from '@element-plus/icons-vue'
import AddPermission from './AddPermission.vue'
import EditPermission from './EditPermission.vue'
import Perms from '@/plugins/directives/permissions'
import Storage from '@/utils/storage'
import { useApiStore } from '@/apis'

// ---------- 搜索表单数据定义 ----------
const searchFormRef = ref()
const deafultSearchForm = {
  module: null,
  identifier: null,
  name: null,
  activated: null,
  timeRange: null
}
const searchForm = ref(deafultSearchForm)

// ---------- 表格数据定义 ----------
const PAGE_NUM_KEY = 'iam.permission_manage.pageNum'
const PAGE_SIZE_KEY = 'iam.permission_manage.pageSize'
const pageSizeList = ref([10, 20, 50, 100])
const formerPageSize = ref(0)
const formPageNum = ref(Storage.get(PAGE_NUM_KEY) || 1) // 初始页码（注意：自然页码，下标从1开始）
const formPageSize = ref(Storage.get(PAGE_SIZE_KEY) || pageSizeList.value[0]) // 初始分页大小
const formTotalPages = ref(0) // 初始总页数
const formTotalElements = ref(0) // 初始总记录数
const formList = ref([]) // 初始分页列表
const currRowKey = ref()
const loading = ref(false)
watch(
  () => formPageNum.value,
  (value, oldValue) => {
    Storage.set(PAGE_NUM_KEY, value)
  },
  { immediate: true }
)
watch(
  () => formPageSize.value,
  (value, oldValue) => {
    Storage.set(PAGE_SIZE_KEY, value)
  },
  { immediate: true }
)

/**
 * （条件）查询权限列表分页数据渲染表格
 * @param num 页码（注意：num是服务器页码，下标从0开始）
 * @param size 分页大小
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    console.groupCollapsed('（条件）查询权限列表分页数据')
    loading.value = true

    const condition = {
      module: searchForm.value.module,
      identifier: searchForm.value.identifier,
      name: searchForm.value.name,
      activated: searchForm.value.activated,
      stTime: searchForm.value.timeRange != null ? searchForm.value.timeRange[0] : null,
      edTime: searchForm.value.timeRange != null ? searchForm.value.timeRange[1] : null
    }
    console.log('查询条件:', condition)

    await Api.request.iam.permission
      .getPermissionsByPage(num - 1, size, condition) // 注意：服务器页码，下标从0开始，所以-1
      .then(res => {
        if (res && res.success) {
          console.log('成功获取权限列表分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, permissions } = res.data
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = permissions
          success = true
        } else {
          console.log('获取权限列表失败')
          ElMessage.error(res && res.message ? res.message : '获取权限列表失败')
        }
      })
      .catch(error => {
        // 异常已统一处理，此处忽略异常
      })

    loading.value = false
    console.groupEnd()
  }
  return success
}
getList(formPageNum.value, formPageSize.value)

/**
 * 重置
 */
function reset() {
  searchForm.value = deafultSearchForm
  searchFormRef.value.resetFields()
  getList(1, formPageSize.value)
}

/**
 * 新增权限
 */
const showAddPermission = ref(false)
async function afterAdd(id) {
  formPageNum.value = 1
  // 获取新权限的排名
  await Api.request.iam.permission
    .getRowNumStartFrom1(id)
    .then(res => {
      if (res && res.success) {
        console.log('成功获取新权限的排名')
        const { rowNum } = res.data
        formPageNum.value = Math.floor((rowNum - 1) / formPageSize.value) + 1
      } else {
        console.log('获取新权限的排名失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
  // 查询新权限所在分页
  searchForm.value = deafultSearchForm
  searchFormRef.value.resetFields()
  await getList(formPageNum.value, formPageSize.value)
  // 选中最新增加的权限记录
  currRowKey.value = id
}

/**
 * 刷新表格
 */
async function refresh() {
  const result = await getList(formPageNum.value, formPageSize.value)
  if (result) {
    ElMessage.success('表格刷新完成')
  }
}

/**
 * 启用/禁用
 * @param row 当前行
 */
function onChangeStatus(row) {
  const { id, identifier, name, activated } = row
  const message = '是否' + (activated ? '禁用' : '激活') + '权限【' + identifier + (name ? ' / ' + name : '') + '】？'
  ElMessageBox.confirm(message, '请确认', { type: 'warning' })
    .then(() => {
      const input = { id: id, activated: !activated }
      Api.request.iam.permission
        .editPermission(input)
        .then(res => {
          if (res && res.success) {
            if (activated) {
              const succMesg = '成功禁用权限【' + identifier + (name ? ' / ' + name : '') + '】'
              ElMessage.warning(succMesg)
            } else {
              const succMesg = '成功激活权限【' + identifier + (name ? ' / ' + name : '') + '】'
              ElMessage.success(succMesg)
            }
            row.activated = !row.activated
          } else {
            console.log('激活 / 禁用权限失败')
            ElMessage.error(res && res.message ? res.message : '激活 / 禁用权限失败')
          }
        })
        .catch(error => {
          // 异常已统一处理，此处忽略异常
        })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

/**
 * 修改权限
 */
const showEditPermission = ref(false)
const nowRow = ref({})
function onEdit(row) {
  showEditPermission.value = true
  nowRow.value = row
}
// 编辑权限后处理，回显数据
function afterEdit(permission) {
  console.log('回显编辑后的权限信息')
  for (let i = 0; i < formList.value.length; i++) {
    if (permission.id === formList.value[i].id) {
      formList.value[i].module = permission.module
      formList.value[i].identifier = permission.identifier
      formList.value[i].name = permission.name
      formList.value[i].remark = permission.remark
      break
    }
  }
  currRowKey.value = permission.id
}

/**
 * 删除权限
 * @param row 当前行
 */
function onDelete(row) {
  const { id, identifier, name } = row
  const message = '是否删除权限【' + identifier + (name ? ' / ' + name : '') + '】？'
  ElMessageBox.confirm(message, '请确认', { type: 'warning' })
    .then(() => {
      Api.request.iam.permission
        .deletePermission(id)
        .then(res => {
          if (res && res.success) {
            const succMesg = '成功删除权限【' + identifier + (name ? ' / ' + name : '') + '】'
            ElMessage.success(succMesg)
            getList(formPageNum.value, formPageSize.value)
          } else {
            console.log('删除权限失败')
            ElMessage.error(res && res.message ? res.message : '删除权限失败')
          }
        })
        .catch(error => {
          // 异常已统一处理，此处忽略异常
        })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

/**
 * 计算序号
 * @param index 表格当前页下标，从0开始
 */
function getIndex(index) {
  return (formPageNum.value - 1) * formPageSize.value + index + 1
}

/**
 * 分页器改变页码大小
 * 为了在改变分页大小后，依然显示当前浏览的数据，需要对新页码进行计算
 */
function onSizeChange() {
  console.log('改变分页大小')
  // 旧页码和旧大小
  const num0 = formPageNum.value - 1 // 转成服务器页码
  const size0 = formerPageSize.value
  // 新页码和新大小
  const size1 = formPageSize.value
  const num1 = Math.floor((num0 * size0 + 0) / size1) // 以旧分页中的第1个记录为锚计算新页码
  formPageNum.value = num1 + 1 // 转成自然页码
  getList(formPageNum.value, formPageSize.value)
}

/**
 * 自定义表格行高
 */
function tableRow() {
  return {
    height: '4rem'
  }
}

/**
 * 监听条件搜索框DOM组件高度
 * 动态渲染表格高度
 */
const searchBoxHeight = ref('0rem')
onMounted(() => {
  const searchBoxDOM = document.getElementsByClassName('search-box-inline')[0]
  const resizeObserver = new ResizeObserver(entries => {
    searchBoxHeight.value = '' + entries[0].contentRect.height / 10 + 'rem'
  })
  resizeObserver.observe(searchBoxDOM)
})
</script>

<style lang="scss" scoped>
@import '../../layout/index.module.scss';

.page-wrapper {
  width: 100%;
  height: 100%;

  .scrollbar-wrapper {
    .el-scrollbar__view {
      height: 100% !important;
    }

    .card-wrapper {
      width: 100%;
      min-height: 100%;
      display: flex;
      justify-content: center;

      .card {
        width: calc(100% - 0.2rem);
        min-height: calc(100% - 0.2rem);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;

        .el-card__body {
          min-height: calc(100% - 2 * var(--el-card-padding)) !important;
        }

        .search-box-inline {
          margin-top: 2rem;

          // 在版本2.5.0之后，el-select的默认宽度更改为100%，当使用内联形式时，宽度将显示异常。
          // 为了保持显示正常, 您需要手动配置el-select的宽度，例如：
          .el-form-item {
            .el-input,
            .el-select {
              width: 20rem;
            }
          }
        }

        .table-wrapper {
          width: 100%;
          // 全屏高度: 100vh
          // 减去Navbar高度: $--navbar-height
          // 减去Tagbar高度: $--tagbar-height
          // 减去新增、刷新按钮高度: 2.4rem
          // 减去翻页组件高度: 4.4rem
          // 减去调整值: 6.7rem
          // 减去条件搜索框高度: 计算得到
          --search-box-height: v-bind(searchBoxHeight);
          height: calc(100vh - $--navbar-height - $--tagbar-height - 2.4rem - 4.4rem - 6.7rem - var(--search-box-height));
        }

        .pagination-wrapper {
          padding-top: 2rem;
        }
      }
    }
  }
}
</style>
