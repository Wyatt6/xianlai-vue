<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <div class="btn-wrap">
          <el-button size="small" type="success" :icon="Refresh" @click="refresh">刷新</el-button>
          <div class="open-register">
            <span style="margin-right: 0.5rem">开启门户页面用户注册功能</span>
            <el-switch />
          </div>
        </div>
        <el-form
          class="search-box-inline"
          :inline="true"
          size="small"
          label-position="right"
          label-width="6rem"
          ref="searchFormRef"
          :model="searchForm"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="searchForm.username" clearable />
          </el-form-item>
          <el-form-item label="注册时间" prop="registerTimeRange">
            <el-date-picker
              v-model="searchForm.registerTimeRange"
              type="datetimerange"
              start-placeholder="开始时间（含）"
              end-placeholder="结束时间（含）"
            />
          </el-form-item>
          <el-form-item label="用户状态" prop="active">
            <el-select v-model="searchForm.active" clearable>
              <el-option label="正常" value="true" />
              <el-option label="冻结" value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="注销状态" prop="isDelete">
            <el-select v-model="searchForm.isDelete" clearable>
              <el-option label="未注销" value="false" />
              <el-option label="已注销" value="true" />
            </el-select>
          </el-form-item>
          <el-form-item label="包含角色" prop="role">
            <el-input v-model="searchForm.role" clearable />
          </el-form-item>
          <el-form-item label="包含权限" prop="permission">
            <el-input v-model="searchForm.permission" clearable />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" @click="getList(1, formPageSize)">搜索</el-button>
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
            <el-table-column label="用户ID" prop="id" width="160" />
            <el-table-column label="用户名" prop="username" />
            <el-table-column label="状态" align="center" width="85">
              <template #default="scope">
                <el-tag v-if="scope.row.isDelete" type="info">已注销</el-tag>
                <el-tag v-else :type="scope.row.active ? 'success' : 'danger'">
                  {{ scope.row.active ? '正常' : '冻结' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" align="center" width="175">
              <template #default="scope">
                {{ new Date(scope.row.registerTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="140" fixed="right" v-perm="['user:query', 'user:edit', 'user:delete']">
              <template #default="scope">
                <el-button-group size="small">
                  <el-tooltip effect="dark" content="查看用户绑定的角色" placement="top">
                    <el-button v-perm="['user:query']" :icon="Search" plain type="primary" @click="onBind(scope.row)" />
                  </el-tooltip>
                  <el-button v-perm="['user:edit']" :icon="Edit" plain @click="onEdit(scope.row)" />
                  <el-tooltip effect="dark" content="注销用户" placement="top">
                    <el-button v-perm="['user:delete']" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
                  </el-tooltip>
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
      <EditUser :show="showEditUser" :nowRow="nowRow" @close="showEditUser = false" @afterEdit="afterEdit" />
      <BindRole :show="showBindRole" :nowRow="nowRow" @close="showBindRole = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Brush, Edit, Delete } from '@element-plus/icons-vue'
import EditUser from './EditUser.vue'
import BindRole from './BindRole.vue'
import Storage from '@/utils/storage'
import Logger from '@/utils/logger'
import { useApiStore } from '@/apis'

const Api = useApiStore()

// ---------- 搜索表单数据定义 ----------
const SEARCHED_KEY = 'iam.user_manage.searched'
const SEARCH_FORM_KEY = 'iam.user_manage.searchForm'
const searched = ref(Storage.get(SEARCHED_KEY) || false)
const searchFormRef = ref()
const deafultSearchForm = {
  username: null,
  active: null,
  isDelete: null,
  registerTimeRange: null,
  role: null,
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
const PAGE_NUM_KEY = 'iam.user_manage.pageNum'
const PAGE_SIZE_KEY = 'iam.user_manage.pageSize'
const pageSizeList = ref([20, 50, 100, 500, 1000])
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
 * 条件查询用户列表分页渲染表格
 * @param num 页码（注意：num是服务器页码，下标从0开始）
 * @param size 分页大小
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    loading.value = true
    const condition = {
      username: searchForm.value.username,
      active: searchForm.value.active,
      isDelete: searchForm.value.isDelete,
      stRegisterTime: searchForm.value.registerTimeRange != null ? searchForm.value.registerTimeRange[0] : null,
      edRegisterTime: searchForm.value.registerTimeRange != null ? searchForm.value.registerTimeRange[1] : null,
      role: searchForm.value.role,
      permission: searchForm.value.permission
    }
    Logger.log('条件查询用户列表分页数据')
    Api.request.iam.user
      .getPageConditionally({ pageNum: num - 1, pageSize: size }, condition) // 注意：服务器页码，下标从0开始，所以-1
      .then(result => {
        if (result && result.success) {
          Logger.log('成功获取用户列表分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, content } = result.data
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = content
          success = true
        } else {
          Logger.log('获取用户列表失败')
          ElMessage.error(result && result.failMessage ? result.failMessage : '获取用户列表失败')
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
 * 刷新表格
 */
async function refresh() {
  const result = await getList(formPageNum.value, formPageSize.value)
  if (result) {
    ElMessage.success('表格刷新完成')
  }
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
 * 查看角色绑定
 */
const showBindRole = ref(false)
const nowRow = ref()
function onBind(row) {
  showBindRole.value = true
  nowRow.value = row
}

/**
 * 修改用户
 */
const showEditUser = ref(false)
function onEdit(row) {
  showEditUser.value = true
  nowRow.value = row
}
// 编辑用户后处理，回显数据
function afterEdit(userInfo) {
  for (let i = 0; i < formList.value.length; i++) {
    if (userInfo.id === formList.value[i].id) {
      formList.value[i].username = userInfo.username
      formList.value[i].active = userInfo.active
      break
    }
  }
  currRowKey.value = userInfo.id
}

/**
 * 注销用户
 * @param row 当前行
 */
function onDelete(row) {
  const message = '注销后用户数据不会删除，但该用户和用户名无法重新使用。请确认是否继续注销用户？'
  ElMessageBox.confirm(message, '注销用户', { type: 'warning', dangerouslyUseHTMLString: true })
    .then(() => {
      const message =
        '注销后用户数据不会删除，但该用户和用户名无法重新使用。请确认是否继续注销用户？坚持注销请在下面输入用户名确认： <b>' + row.username + '</b>'
      ElMessageBox.prompt(message, '再次确认注销用户', {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        inputErrorMessage: '请输入所要注销的用户正确的用户名',
        inputValidator: text => {
          return text === row.username
        }
      })
        .then(() => {
          Api.request.iam.user.editUserInfo(null, { id: row.id, isDelete: true }).then(result => {
            if (result && result.success) {
              const succMesg = '成功注销用户【' + row.username + '】'
              ElMessage.success(succMesg)
              getList(formPageNum.value, formPageSize.value)
            } else {
              Logger.log('注销用户失败')
              ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '注销用户失败')
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

      .btn-wrap {
        width: 100%;
        display: flex;
        align-items: center;

        .open-register {
          display: flex;
          align-items: center;
          margin-left: 5rem;
          font-size: 1.6rem;
        }
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
