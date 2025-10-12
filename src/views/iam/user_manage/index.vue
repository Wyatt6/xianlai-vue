<template>
  <div class="page-wrapper">
    <el-scrollbar class="scrollbar-wrapper">
      <div class="card-wrapper">
        <el-card class="card" shadow="never">
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
            <el-form-item label="用户名" prop="username">
              <el-input v-model="searchForm.username" clearable />
            </el-form-item>
            <el-form-item label="用户状态" prop="activated">
              <el-select v-model="searchForm.activated" clearable>
                <el-option label="正常" value="true" />
                <el-option label="冻结" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="注册时间" prop="createTimeRange">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="datetimerange"
                start-placeholder="开始时间（含）"
                end-placeholder="结束时间（含）"
              />
            </el-form-item>
            <el-form-item label="最近登录" prop="lastLoginTimeRange">
              <el-date-picker
                v-model="searchForm.lastLoginTimeRange"
                type="datetimerange"
                start-placeholder="开始时间（含）"
                end-placeholder="结束时间（含）"
              />
            </el-form-item>
            <el-form-item label="包含角色" prop="role">
              <el-input v-model="searchForm.role" clearable />
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
              <el-table-column label="序号" align="center" width="90" type="index" :index="getIndex" />
              <el-table-column label="用户名" prop="username" />
              <el-table-column label="用户状态" align="center" width="90">
                <template #default="scope">
                  <el-tag :type="scope.row.activated ? 'success' : 'danger'">
                    {{ scope.row.activated ? '正常' : '冻结' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="注册时间" align="center" width="160">
                <template #default="scope">
                  {{ new Date(scope.row.createTime).toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="最近登录" align="center" width="160">
                <template #default="scope">
                  {{ new Date(scope.row.lastLoginTime).toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="100" fixed="right" v-perm="[Perms.USER_QUERY, Perms.USER_EDIT]">
                <template #default="scope">
                  <el-button-group size="small">
                    <el-tooltip effect="dark" content="查看用户绑定的角色" placement="top">
                      <el-button v-perm="[Perms.USER_QUERY]" :icon="Search" plain type="primary" @click="onBind(scope.row)" />
                    </el-tooltip>
                    <el-tooltip effect="dark" content="冻结" placement="top" v-if="scope.row.activated">
                      <el-button v-perm="[Perms.USER_EDIT]" :icon="Open" plain type="success" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
                    <el-tooltip effect="dark" content="解冻" placement="top" v-else>
                      <el-button v-perm="[Perms.USER_EDIT]" :icon="TurnOff" plain type="danger" @click="onChangeStatus(scope.row)" />
                    </el-tooltip>
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
        <BindRole :show="showBindRole" :nowRow="nowRow" @close="showBindRole = false" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Brush, Open, TurnOff } from '@element-plus/icons-vue'
import BindRole from './BindRole.vue'
import Perms from '@/plugins/directives/permissions'
import Storage from '@/utils/storage'
import { useApiStore } from '@/apis'

// ---------- 搜索表单数据定义 ----------
const searchFormRef = ref()
const deafultSearchForm = {
  username: null,
  activated: null,
  createTimeRange: null,
  lastLoginTimeRange: null,
  role: null
}
const searchForm = ref(deafultSearchForm)

// ---------- 数据定义 ----------
const PAGE_NUM_KEY = 'iam.user_manage.pageNum'
const PAGE_SIZE_KEY = 'iam.user_manage.pageSize'
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
 * （条件）查询用户列表分页数据渲染表格
 * @param num 页码（注意：num是服务器页码，下标从0开始）
 * @param size 分页大小
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    console.groupCollapsed('（条件）获取用户列表分页数据')
    loading.value = true

    const condition = {
      username: searchForm.value.username,
      activated: searchForm.value.activated,
      stCreateTime: searchForm.value.createTimeRange != null ? searchForm.value.createTimeRange[0] : null,
      edCreateTime: searchForm.value.createTimeRange != null ? searchForm.value.createTimeRange[1] : null,
      role: searchForm.value.role,
      stLastLoginTime: searchForm.value.lastLoginTimeRange != null ? searchForm.value.lastLoginTimeRange[0] : null,
      edLastLoginTime: searchForm.value.lastLoginTimeRange != null ? searchForm.value.lastLoginTimeRange[1] : null
    }
    console.log('查询条件:', condition)

    await Api.request.iam.user
      .getUsersByPage(num - 1, size, condition) // 注意：服务器页码，下标从0开始，所以-1
      .then(res => {
        if (res && res.success) {
          console.log('成功获取用户列表分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, users } = res.data
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = users
          success = true
        } else {
          console.log('获取用户列表失败')
          ElMessage.error(res && res.message ? res.message : '获取用户列表失败')
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
  searchFormRef.value.resetFields()
  getList(1, formPageSize.value)
}

/**
 * 冻结/解冻
 * @param row 当前行
 */
const onChangeStatus = row => {
  const { id, username, activated } = row
  const message = `是否${activated ? '冻结' : '解冻'}用户【${username}】？`
  ElMessageBox.confirm(message, '请确认', { type: 'warning' })
    .then(() => {
      if (activated) {
        Api.request.iam.user
          .freeze(id)
          .then(res => {
            if (res && res.success) {
              const succMesg = `成功冻结用户【${username}】`
              ElMessage.warning(succMesg)
              row.activated = false
            } else {
              console.log('冻结用户失败')
              ElMessage.error(res && res.message ? res.message : '冻结用户失败')
            }
          })
          .catch(error => {
            // 异常已统一处理，此处忽略异常
          })
      } else {
        Api.request.iam.user
          .unfreeze(id)
          .then(res => {
            if (res && res.success) {
              const succMesg = `成功解冻用户【${username}】`
              ElMessage.success(succMesg)
              row.activated = true
            } else {
              console.log('解冻用户失败')
              ElMessage.error(res && res.message ? res.message : '解冻用户失败')
            }
          })
          .catch(error => {
            // 异常已统一处理，此处忽略异常
          })
      }
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

/**
 * 计算序号
 * @param index 下标从0开始
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
 * 查看角色绑定
 */
const showBindRole = ref(false)
const nowRow = ref()
function onBind(row) {
  showBindRole.value = true
  nowRow.value = row
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
