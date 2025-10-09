<template>
  <div class="page-wrapper">
    <el-scrollbar class="scrollbar-wrapper">
      <div class="card-wrapper">
        <el-card class="card" shadow="never">
          <el-button size="small" type="primary" :icon="Plus" v-perm="[Perms.ROLE_ADD]" @click="showAddRole = true"> 新增 </el-button>
          <el-button size="small" type="success" :icon="Refresh" @click="refresh">刷新</el-button>
          <el-form
            class="search-box-inline"
            :inline="true"
            size="small"
            label-position="right"
            label-width="6rem"
            ref="searchFormRef"
            :model="searchForm"
          >
            <el-form-item label="角色标识" prop="identifier">
              <el-input v-model="searchForm.identifier" clearable />
            </el-form-item>
            <el-form-item label="角色名称" prop="name">
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
            <el-form-item label="包含权限" prop="permission">
              <el-input v-model="searchForm.permission" clearable />
            </el-form-item>
            <el-form-item>
              <el-button :icon="Search" @click="onSearch">搜索</el-button>
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
              <el-table-column label="角色标识" prop="identifier" />
              <el-table-column label="角色名称">
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
              <el-table-column label="操作" align="center" width="240" fixed="right" v-perm="[Perms.ROLE_QUERY, Perms.ROLE_EDIT, Perms.ROLE_DELETE]">
                <template #default="scope">
                  <el-button-group size="small">
                    <el-tooltip effect="dark" content="查看授权" placement="top">
                      <el-button v-perm="[Perms.ROLE_QUERY]" :icon="Search" plain type="primary" @click="onGrant(scope.row)" />
                    </el-tooltip>
                    <el-tooltip effect="dark" content="禁用" placement="top" v-if="scope.row.activated">
                      <el-button v-perm="[Perms.ROLE_EDIT]" :icon="Open" plain type="success" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
                    <el-tooltip effect="dark" content="激活" placement="top" v-else>
                      <el-button v-perm="[Perms.ROLE_EDIT]" :icon="TurnOff" plain type="danger" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
                    <el-button v-perm="[Perms.ROLE_EDIT]" :icon="Edit" plain @click="onEdit(scope.row)" />
                    <el-button v-perm="[Perms.ROLE_EDIT]" v-if="!searched" :icon="Top" plain @click="moveUp(scope)" />
                    <el-button v-perm="[Perms.ROLE_EDIT]" v-if="!searched" :icon="Bottom" plain @click="moveDown(scope)" />
                    <el-button v-perm="[Perms.ROLE_DELETE]" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
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
        <AddRole :show="showAddRole" @close="showAddRole = false" @afterAdd="afterAdd" />
        <EditRole :show="showEditRole" :nowRow="nowRow" @close="showEditRole = false" @afterEdit="afterEdit" />
        <GrantPermission :show="showGrantPermission" :nowRow="nowRow" @close="showGrantPermission = false" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Brush, Open, TurnOff, Edit, Top, Bottom, Delete } from '@element-plus/icons-vue'
import AddRole from './AddRole.vue'
import EditRole from './EditRole.vue'
import GrantPermission from './GrantPermission.vue'
import Perms from '@/plugins/directives/permissions'
import Storage from '@/utils/storage'
import { isEmpty } from '@/utils/common'
import { useApiStore } from '@/apis'

// ---------- 搜索表单数据定义 ----------
const searched = ref(false)
const searchFormRef = ref()
const deafultSearchForm = {
  identifier: null,
  name: null,
  activated: null,
  timeRange: null,
  permission: null
}
const searchForm = ref(deafultSearchForm)

// ---------- 数据定义 ----------
const PAGE_NUM_KEY = 'iam.role_manage.pageNum'
const PAGE_SIZE_KEY = 'iam.role_manage.pageSize'
const pageSizeList = ref([10, 20, 50, 100])
const formerPageSize = ref(0)
const formPageNum = ref(Storage.get(PAGE_NUM_KEY) || 1) // 初始页码（注意：自然页码，下标从1开始）
const formPageSize = ref(Storage.get(PAGE_SIZE_KEY) || pageSizeList.value[0]) // 初始分页大小
const formTotalPages = ref(0) // 初始总页数
const formTotalElements = ref(0) // 初始总记录数
const formList = ref([]) // 初始分页列表
const currRowKey = ref()
const loading = ref(false)
const nowRow = ref()
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
 * 获取角色列表分页数据渲染表格（访问API）
 * @param num 页码
 * @param size 页尺寸
 */
async function getRolesByPage(num, size, condition) {
  // 注意：num是服务器页码，下标从0开始
  return Api.request.iam.role
    .getRolesByPage(num, size, condition)
    .then(res => {
      if (res && res.success) {
        console.log('成功获取角色列表分页数据')
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
 * （条件）查询角色分页数据渲染表格
 * @param num 页码
 * @param size 页尺寸
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    console.groupCollapsed('（条件）查询角色列表分页数据')
    loading.value = true

    const condition = {
      identifier: searchForm.value.identifier,
      name: searchForm.value.name,
      activated: searchForm.value.activated,
      stTime: searchForm.value.timeRange != null ? searchForm.value.timeRange[0] : null,
      edTime: searchForm.value.timeRange != null ? searchForm.value.timeRange[1] : null,
      permission: searchForm.value.permission
    }
    console.log('查询条件:', condition)

    const result = await getRolesByPage(num - 1, size, condition)
    if (!isEmpty(result)) {
      const { pageNum, pageSize, totalPages, totalElements, roles } = result
      console.log('渲染表格')
      formerPageSize.value = formPageSize.value
      formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
      formPageSize.value = pageSize
      formTotalPages.value = totalPages
      formTotalElements.value = totalElements
      formList.value = roles
      success = true
    }

    loading.value = false
    console.groupEnd()
  }
  return success
}
getList(formPageNum.value, formPageSize.value)

/**
 * 搜索
 */
function onSearch() {
  searched.value = false
  if (!isEmpty(searchForm.value.identifier)) searched.value = true
  if (!isEmpty(searchForm.value.name)) searched.value = true
  if (!isEmpty(searchForm.value.activated)) searched.value = true
  if (!isEmpty(searchForm.value.timeRange)) searched.value = true
  if (!isEmpty(searchForm.value.permission)) searched.value = true
  getList(1, formPageSize.value)
}

/**
 * 重置
 */
function reset() {
  searched.value = false
  searchForm.value = deafultSearchForm
  searchFormRef.value.resetFields()
  getList(1, formPageSize.value)
}

/**
 * 新增角色
 */
const showAddRole = ref(false)
async function afterAdd(id) {
  formPageNum.value = 1
  // 获取新角色的排名
  await Api.request.iam.role
    .getRowNumStartFrom1(id)
    .then(res => {
      if (res && res.success) {
        console.log('成功获取新角色的排名')
        const { rowNum } = res.data
        formPageNum.value = Math.floor((rowNum - 1) / formPageSize.value) + 1
      } else {
        console.log('获取新角色的排名失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
  // 查询新角色所在分页
  searchForm.value = deafultSearchForm
  searchFormRef.value.resetFields()
  await getList(formPageNum.value, formPageSize.value)
  // 选中最新增加的角色记录
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
 * 查看授权
 */
const showGrantPermission = ref(false)
function onGrant(row) {
  showGrantPermission.value = true
  nowRow.value = row
}

/**
 * 启用/禁用
 * @param row 当前行
 */
function onChangeStatus(row) {
  const { id, identifier, name, activated } = row
  const message = '是否' + (activated ? '禁用' : '激活') + '角色【' + identifier + (name ? ' / ' + name : '') + '】？'
  ElMessageBox.confirm(message, '请确认', { type: 'warning' })
    .then(() => {
      const input = { id: id, activated: !activated }
      Api.request.iam.role
        .editRole(input)
        .then(res => {
          if (res && res.success) {
            if (activated) {
              const succMesg = '成功禁用角色【' + identifier + (name ? ' / ' + name : '') + '】'
              ElMessage.warning(succMesg)
            } else {
              const succMesg = '成功激活角色【' + identifier + (name ? ' / ' + name : '') + '】'
              ElMessage.success(succMesg)
            }
            row.activated = !row.activated
          } else {
            console.log('激活 / 禁用角色失败')
            ElMessage.error(res && res.message ? res.message : '激活 / 禁用角色失败')
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
 * 编辑角色
 */
const showEditRole = ref(false)
function onEdit(row) {
  showEditRole.value = true
  nowRow.value = row
}
// 编辑角色后处理，回显数据
function afterEdit(role) {
  console.log('回显编辑后的角色信息')
  for (let i = 0; i < formList.value.length; i++) {
    if (role.id === formList.value[i].id) {
      formList.value[i].identifier = role.identifier
      formList.value[i].name = role.name
      formList.value[i].remark = role.remark
      break
    }
  }
  currRowKey.value = role.id
}

/**
 * 上移、下移操作
 */
async function swapPosition(id1, id2) {
  return Api.request.iam.role
    .swapPosition(id1, id2)
    .then(res => {
      if (res && res.success) {
        console.log('移动成功')
        return res.data
      } else {
        console.log(res.message)
        ElMessage.error('移动失败')
      }
    })
    .catch(error => {
      // 异常已统一处理，此处忽略异常
    })
}
/**
 * 上移
 */
async function moveUp(scope) {
  console.groupCollapsed('上移角色记录', 'index=', scope.$index)
  const index = scope.$index
  const row = scope.row
  if (index === 0) {
    if (formPageNum.value === 1) {
      ElMessage.error('已经是第1行，无法再上移')
      console.log('已经是第1页第1条，无法再上移')
    } else {
      console.log('在当页第1条，需要先查询上一页角色数据')
      const { roles } = await getRolesByPage(formPageNum.value - 1 - 1, formPageSize.value) // 注意：服务器页码，下标从0开始
      const id1 = row.id
      const id2 = roles[roles.length - 1].id
      console.log('id1=', id1, 'sortId_1=', row.sortId)
      console.log('id2=', id2, 'sortId_2=', roles[roles.length - 1].sortId)
      const { role1, role2 } = await swapPosition(id1, id2)
      if (role1 != null && role2 != null) {
        console.log('跳转到上一页，自动跟踪')
        formPageNum.value = formPageNum.value - 1
        roles[roles.length - 1] = role1
        formList.value = roles
        currRowKey.value = id1
        ElMessage.success('移动完成')
      }
    }
  } else {
    const id1 = row.id
    const id2 = formList.value[index - 1].id
    console.log('id1=', id1, 'sortId_1=', row.sortId)
    console.log('id2=', id2, 'sortId_2=', formList.value[index - 1].sortId)
    const { role1, role2 } = await swapPosition(id1, id2)
    if (role1 != null && role2 != null) {
      console.log('渲染表格')
      formList.value[index].sortId = role1.sortId
      formList.value[index - 1].sortId = role2.sortId
      const temp = formList.value[index]
      formList.value[index] = formList.value[index - 1]
      formList.value[index - 1] = temp
      ElMessage.success('移动完成')
    }
  }
  console.groupEnd()
}
/**
 * 下移
 */
async function moveDown(scope) {
  console.groupCollapsed('下移角色记录', 'index=', scope.$index)
  const index = scope.$index
  const row = scope.row
  if (index === formList.value.length - 1) {
    if (formPageNum.value === formTotalPages.value) {
      ElMessage.error('已经是最后一行，无法再下移')
      console.log('已经是最后一行，无法再下移')
    } else {
      console.log('在当页最后一条，需要先查询下一页角色数据')
      const { roles } = await getRolesByPage(formPageNum.value + 1 - 1, formPageSize.value) // 注意：服务器页码，下标从0开始
      const id1 = row.id
      const id2 = roles[0].id
      console.log('id1=', id1, 'sortId_1=', row.sortId)
      console.log('id2=', id2, 'sortId_2=', roles[0].sortId)
      const { role1, role2 } = await swapPosition(id1, id2)
      if (role1 != null && role2 != null) {
        console.log('跳转到下一页，自动跟踪')
        formPageNum.value = formPageNum.value + 1
        roles[0] = role1
        formList.value = roles
        currRowKey.value = id1
        ElMessage.success('移动完成')
      }
    }
  } else {
    const id1 = row.id
    const id2 = formList.value[index + 1].id
    console.log('id1=', id1, 'sortId_1=', row.sortId)
    console.log('id2=', id2, 'sortId_2=', formList.value[index + 1].sortId)
    const { role1, role2 } = await swapPosition(id1, id2)
    if (role1 != null && role2 != null) {
      console.log('渲染表格')
      formList.value[index].sortId = role1.sortId
      formList.value[index + 1].sortId = role2.sortId
      const temp = formList.value[index]
      formList.value[index] = formList.value[index + 1]
      formList.value[index + 1] = temp
      ElMessage.success('移动完成')
    }
  }
  console.groupEnd()
}

/**
 * 删除角色
 * @param row 当前行
 */
function onDelete(row) {
  const { id, identifier, name } = row
  const message = '是否删除角色【' + identifier + (name ? ' / ' + name : '') + '】？'
  ElMessageBox.confirm(message, '请确认', { type: 'warning' })
    .then(() => {
      Api.request.iam.role
        .deleteRole(id)
        .then(res => {
          if (res && res.success) {
            const succMesg = '成功删除角色【' + identifier + (name ? ' / ' + name : '') + '】'
            ElMessage.success(succMesg)
            getList(formPageNum.value, formPageSize.value)
          } else {
            console.log('删除角色失败')
            ElMessage.error(res && res.message ? res.message : '删除角色失败')
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
 * @param index 本页下标，从0开始
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
const tableRow = () => {
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
