<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <el-button size="small" type="primary" :icon="Plus" v-perm="['role:add']" @click="showAdd = true">新增</el-button>
        <el-button size="small" type="success" :icon="Refresh" @click="refresh()">刷新</el-button>
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
          <el-form-item label="状态" prop="active">
            <el-select v-model="searchForm.active" clearable>
              <el-option label="生效" value="true" />
              <el-option label="未生效" value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色说明" prop="description">
            <el-input v-model="searchForm.description" clearable />
          </el-form-item>
          <el-form-item label="包含权限" prop="permission">
            <el-input v-model="searchForm.permission" clearable />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" @click="onSearch()">搜索</el-button>
            <el-button :icon="Brush" @click="reset()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="table-wrap">
          <el-table
            height="100%"
            stripe
            row-key="id"
            :row-style="tableRow"
            highlight-current-row
            :data="formList"
            :current-row-key="currRowKey"
            v-loading="loading"
            border
          >
            <el-table-column label="序号" align="center" min-width="55" type="index" :index="getIndex" />
            <el-table-column label="排序ID" align="center" prop="sortId" min-width="80" />
            <el-table-column label="角色标识" prop="identifier" min-width="200" />
            <el-table-column label="角色名称" prop="name" min-width="200" />
            <el-table-column label="状态" align="center" min-width="85">
              <template #default="scope">
                <el-tag :type="scope.row.active ? 'success' : 'danger'">
                  {{ scope.row.active ? '生效' : '未生效' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="角色说明" prop="description" min-width="320" />
            <el-table-column label="用户绑定检查" align="center" min-width="110">
              <template #default="scope">
                <el-tag :type="scope.row.bindCheck ? 'success' : 'danger'">
                  {{ scope.row.bindCheck ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="140" fixed="right" v-perm="['role:query', 'role:edit', 'role:delete']">
              <template #default="scope">
                <el-button-group size="small">
                  <el-tooltip effect="dark" content="查看授权" placement="top">
                    <el-button v-perm="['role:query']" :icon="Search" plain type="primary" @click="onGrant(scope.row)" />
                  </el-tooltip>
                  <el-button v-perm="['role:edit']" :icon="Edit" plain @click="onEdit(scope.row)" />
                  <el-button v-perm="['role:delete']" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagination-wrap">
          <el-pagination
            size="small"
            layout="total, sizes, prev, pager, next, jumper"
            :total="formTotalElements"
            :page-sizes="pageSizeList"
            v-model:page-size="formPageSize"
            @size-change="onSizeChange()"
            background
            v-model:current-page="formPageNum"
            @current-change="getList(formPageNum, formPageSize)"
          />
        </div>
      </el-card>
      <AddRole :show="showAdd" @close="showAdd = false" @afterAdd="afterAdd" />
      <EditRole :show="showEdit" :nowRow="nowRow" @close="showEdit = false" @afterEdit="afterEdit" />
      <GrantPermission :show="showGrantPermission" :nowRow="nowRow" @close="showGrantPermission = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Brush, Edit, Delete } from '@element-plus/icons-vue'
import AddRole from './AddRole.vue'
import EditRole from './EditRole.vue'
import GrantPermission from './GrantPermission.vue'
import Storage from '@/utils/storage'
import { notEmpty } from '@/utils/common'
import { useApiStore } from '@/apis'

const Api = useApiStore()

// ---------- 搜索表单数据定义 ----------
const SEARCHED_KEY = 'iam.role_manage.searched'
const SEARCH_FORM_KEY = 'iam.role_manage.searchForm'
const searched = ref(Storage.get(SEARCHED_KEY) || false)
const searchFormRef = ref()
const deafultSearchForm = {
  identifier: null,
  name: null,
  active: null,
  description: null,
  permission: null
}
const searchForm = ref(Storage.get(SEARCHED_KEY) ? Storage.get(SEARCH_FORM_KEY) : deafultSearchForm)
watch(
  () => searched.value,
  (value, oldValue) => {
    Storage.set(SEARCHED_KEY, value)
    Storage.set(SEARCH_FORM_KEY, searchForm.value)
  },
  { immediate: true }
)

// ---------- 数据定义 ----------
const PAGE_NUM_KEY = 'iam.role_manage.pageNum'
const PAGE_SIZE_KEY = 'iam.role_manage.pageSize'
const pageSizeList = ref([20, 50, 100, 500])
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
 * （条件）查询角色分页数据渲染表格
 * @param num 页码
 * @param size 页尺寸
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    loading.value = true
    const condition = {
      identifier: searchForm.value.identifier,
      name: searchForm.value.name,
      active: searchForm.value.active,
      description: searchForm.value.description,
      permission: searchForm.value.permission
    }
    console.log('条件查询角色列表分页数据')
    Api.request.iam.role
      .getPageConditionally({ pageNum: num - 1, pageSize: size }, condition) // 注意：服务器页码，下标从0开始，所以-1
      .then(result => {
        if (result && result.success) {
          console.log('成功获取角色列表分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, content } = result.data
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = content
          success = true
        } else {
          console.log('获取角色列表失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取角色列表失败')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
  return success
}
getList(formPageNum.value, formPageSize.value)

/**
 * 搜索
 */
function onSearch() {
  searched.value = false
  if (notEmpty(searchForm.value.identifier)) searched.value = true
  if (notEmpty(searchForm.value.name)) searched.value = true
  if (notEmpty(searchForm.value.active)) searched.value = true
  if (notEmpty(searchForm.value.description)) searched.value = true
  if (notEmpty(searchForm.value.permission)) searched.value = true
  getList(1, formPageSize.value)
}

/**
 * 重置
 */
function reset() {
  searchForm.value = deafultSearchForm
  searched.value = false
  searchFormRef.value.resetFields()
  getList(1, formPageSize.value)
}

/**
 * 新增角色
 */
const showAdd = ref(false)
async function afterAdd(role, rowNum) {
  searchForm.value = deafultSearchForm
  searched.value = false
  searchFormRef.value.resetFields()
  // 查询新角色所在分页
  formPageNum.value = Math.floor((rowNum - 1) / formPageSize.value) + 1
  await getList(formPageNum.value, formPageSize.value)
  // 选中最新增加的角色记录
  currRowKey.value = role.id
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
 * 编辑角色
 */
const showEdit = ref(false)
function onEdit(row) {
  showEdit.value = true
  nowRow.value = row
}
// 编辑角色后处理，回显数据
function afterEdit(role) {
  for (let i = 0; i < formList.value.length; i++) {
    if (role.id === formList.value[i].id) {
      formList.value[i].sortId = role.sortId
      formList.value[i].identifier = role.identifier
      formList.value[i].name = role.name
      formList.value[i].active = role.active
      formList.value[i].description = role.description
      break
    }
  }
  currRowKey.value = role.id
}

/**
 * 删除角色
 * @param row 当前行
 */
function onDelete(row) {
  const { id, identifier, name } = row
  const message = '删除后数据不可恢复！<br>请确认是否删除角色【' + identifier + (name ? ' / ' + name : '') + '】？'
  ElMessageBox.confirm(message, '删除角色', { type: 'warning', dangerouslyUseHTMLString: true })
    .then(() => {
      Api.request.iam.role.delete({ roleId: id }).then(result => {
        if (result && result.success) {
          const succMesg = '成功删除角色【' + identifier + (name ? ' / ' + name : '') + '】'
          ElMessage.success(succMesg)
          getList(formPageNum.value, formPageSize.value)
        } else {
          console.log('删除角色失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '删除角色失败')
        }
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
@use '@/views/layout/index.module.scss' as vars;

.page-wrap {
  width: 100%;
  height: 100%;

  .card-wrap {
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

      .table-wrap {
        width: 100%;
        // 全屏高度: 100vh
        // 减去Navbar高度: $navbar-height
        // 减去Tagbar高度: $tagbar-height
        // 减去新增、刷新按钮高度: 2.4rem
        // 减去翻页组件高度: 4.4rem
        // 减去调整值: 6.7rem
        // 减去条件搜索框高度: 计算得到
        --search-box-height: v-bind(searchBoxHeight);
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 2.4rem - 4.4rem - 6.7rem - var(--search-box-height));
      }

      .pagination-wrap {
        padding-top: 2rem;
      }
    }
  }
}
</style>
