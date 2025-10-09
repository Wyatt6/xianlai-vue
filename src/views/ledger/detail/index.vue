<template>
  <div class="page-wrapper">
    <el-scrollbar class="scrollbar-wrapper">
      <div class="card-wrapper">
        <el-card class="card" shadow="never">
          <div class="btn-area">
            <div>
              <el-button size="small" type="primary" :icon="Plus" @click="onAdd()">记账</el-button>
              <el-button size="small" type="success" :icon="Refresh" @click="refresh()">刷新</el-button>
              <el-button size="small" :icon="expand ? 'ArrowUp' : 'ArrowDown'" @click="onExpand()">
                {{ expand ? '取消查询' : '详细查询' }}
              </el-button>
              <el-button size="small" :type="btnType[0]" :bg="btnBg[0]" text @click="onSelectMode(0)" style="margin-left: 3rem"> 总账本 </el-button>
              <el-button size="small" :type="btnType[1]" :bg="btnBg[1]" text @click="onSelectMode(1)">本月账本</el-button>
              <el-button size="small" :type="btnType[2]" :bg="btnBg[2]" text @click="onSelectMode(2)">上月账本</el-button>
            </div>
            <div class="btn-area-right">
              <el-statistic :value="incomeSum" :precision="2" group-separator="">
                <template #title>
                  <div class="stat-box">
                    <LocalIcon name="ri-inbox-archive-line" color="#f56c6c" size="1.4rem" />
                    <span class="stat-title" style="color: #f56c6c">收入合计</span>
                  </div>
                </template>
              </el-statistic>
              <el-statistic :value="outcomeSum" :precision="2" group-separator="">
                <template #title>
                  <div class="stat-box">
                    <LocalIcon name="ri-inbox-unarchive-line" color="#67c23a" size="1.4rem" />
                    <span class="stat-title" style="color: #67c23a">支出合计</span>
                  </div>
                </template>
              </el-statistic>
              <el-statistic :value="incomeSum - outcomeSum" :precision="2" group-separator="">
                <template #title>
                  <div class="stat-box">
                    <LocalIcon name="ri-align-item-bottom-line" color="#409eff" size="1.4rem" />
                    <span class="stat-title" style="color: #409eff">净收入</span>
                  </div>
                </template>
              </el-statistic>
            </div>
          </div>
          <el-form
            class="search-box-inline"
            :style="{ '--search-box-display': searchBoxDisplay }"
            :inline="true"
            size="small"
            label-position="right"
            label-width="auto"
            ref="searchFormRef"
            :model="searchForm"
          >
            <el-form-item label="日期" prop="dateRange">
              <el-date-picker v-model="searchForm.dateRange" type="daterange" start-placeholder="开始日期（含）" end-placeholder="结束日期（含）" />
            </el-form-item>
            <el-form-item label="收支类型" prop="type">
              <el-select v-model="searchForm.type" clearable>
                <el-option label="收入" value="debit" />
                <el-option label="支出" value="credit" />
              </el-select>
            </el-form-item>
            <el-form-item label="记账类别" prop="categoryId">
              <el-tree-select
                v-model="searchForm.categoryId"
                :data="categoryTree"
                :props="treeProps"
                default-expand-all
                highlight-current
                check-strictly
                :expand-on-click-node="false"
                node-key="id"
                clearable
              />
            </el-form-item>
            <el-form-item label="说明" prop="description">
              <el-input v-model="searchForm.description" clearable />
            </el-form-item>
            <el-form-item label="动账账户" prop="accountId">
              <el-select v-model="searchForm.accountId" clearable>
                <el-option v-for="item in accountList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button :icon="Search" @click="onSearch()">搜索</el-button>
              <el-button :icon="Brush" @click="reset()">重置</el-button>
            </el-form-item>
          </el-form>
          <div class="table-wrapper">
            <el-table
              height="100%"
              stripe
              row-key="id"
              highlight-current-row
              :current-row-key="currRowKey"
              v-loading="loading"
              :data="formList"
              border
              size="small"
            >
              <el-table-column label="日期" align="center" width="90">
                <template #default="scope">
                  {{ dateHyphenFormatter(scope.row.acctDate) }}
                </template>
              </el-table-column>
              <el-table-column label="收支类型" align="center" width="65">
                <template #default="scope">
                  <el-tag size="small" v-if="scope.row.type === 'debit'" type="danger">收入</el-tag>
                  <el-tag size="small" v-else-if="scope.row.type === 'credit'" type="success">支出</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="金额（元）" align="right">
                <template #default="scope">
                  {{ parseFloat(scope.row.amount).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="记账类别" align="center">
                <template #default="scope">
                  <el-tag size="small" v-if="scope.row.categoryId != null">{{ getCategoryName(scope.row.categoryId) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="说明" align="center" prop="description" />
              <el-table-column label="动账账户" align="center">
                <template #default="scope">
                  {{ getAccountName(scope.row.accountId) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="90" fixed="right">
                <template #default="scope">
                  <el-button-group size="small">
                    <el-button :icon="Edit" plain @click="onEdit(scope.row)" />
                    <el-popconfirm title="确认删除此条记账流水？" @confirm="onDelete(scope.row)">
                      <template #reference>
                        <el-button :icon="Delete" type="danger" />
                      </template>
                    </el-popconfirm>
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
              @size-change="onSizeChange()"
              background
              v-model:current-page="formPageNum"
              @current-change="getList(formPageNum, formerPageSize)"
            />
          </div>
        </el-card>
      </div>
    </el-scrollbar>
    <JournalDrawer
      :show="showDrawer"
      :title="drawerTitle"
      :data="drawerData"
      :categoryTree="categoryTree"
      :accountList="accountList"
      @close="onCloseDrawer()"
      @save="drawerSaveCallback"
    />
  </div>
</template>

<script setup>
import LocalIcon from '@/components/LocalIcon/index.vue'
import JournalDrawer from './JournalDrawer.vue'
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Search, Brush, Edit, Delete } from '@element-plus/icons-vue'
import Storage from '@/utils/storage'
import { dateHyphenFormatter } from '@/utils/formatter'
import { isEmpty, getDaysOfMonth } from '@/utils/common'
import Apis from '@/apis'

// ---------- 数据定义 ----------
const PAGE_NUM_KEY = 'ledger.detail.pageNum'
const PAGE_SIZE_KEY = 'ledger.detail.pageSize'
const pageSizeList = ref([10, 20, 50, 100])
const formerPageSize = ref(1)
const formPageNum = ref(Storage.get(PAGE_NUM_KEY) || 1) // 初始页码（注意：自然页码，下标从1开始）
const formPageSize = ref(Storage.get(PAGE_SIZE_KEY) || pageSizeList.value[1]) // 初始分页大小
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

// ---------- 搜索表单数据定义 ----------
const SEARCH_FORM = 'ledger.detail.searchForm'
const searchFormRef = ref()
const searchForm = ref(
  Storage.get(SEARCH_FORM) || {
    dateRange: null,
    type: null,
    categoryId: null,
    accountId: null,
    description: null
  }
)

// ----- 条件查询总收入、总支出 -----
let getSumConditionallyFlag = 1
const incomeSum = ref(0)
const outcomeSum = ref(0)
const getSumConditionally = async () => {
  getSumConditionallyFlag--
  if (getSumConditionallyFlag >= 0) {
    const condition = {
      stDate: searchForm.value.dateRange != null ? searchForm.value.dateRange[0] : null,
      edDate: searchForm.value.dateRange != null ? searchForm.value.dateRange[1] : null,
      type: searchForm.value.type != null && searchForm.value.type.length > 0 ? searchForm.value.type : null,
      categoryId: searchForm.value.categoryId,
      accountId: searchForm.value.accountId,
      description: searchForm.value.description
    }
    const { debitSum, creditSum } = await Apis.ledger.journal.getSumConditionally(condition).then(res => {
      if (res && res.success) {
        console.log('成功获取总收入和总支出')
        return res.data
      } else {
        console.log('获取总收入和总支出数据失败')
        ElMessage.error(res && res.message ? res.message : '获取总收入和总支出数据失败')
      }
    })
    incomeSum.value = debitSum != null ? debitSum : 0
    outcomeSum.value = creditSum != null ? creditSum : 0
  }
  getSumConditionallyFlag++
}

// ----- 获取分类树 -----
let getCategoryTreeFlag = 1
const categoryTree = ref([])
const getCategoryTree = async () => {
  getCategoryTreeFlag--
  if (getCategoryTreeFlag >= 0) {
    await Apis.ledger.category.getCategoryTree().then(res => {
      if (res && res.success) {
        console.log('成功获取类别树')
        categoryTree.value = res.data.categoryTree
      } else {
        console.log('获取记账类别失败')
        ElMessage.error(res && res.message ? res.message : '获取记账类别失败')
      }
    })
  }
  getCategoryTreeFlag++
}
const treeProps = ref({
  label: (data, node) => {
    return data.data.name
  },
  value: 'id',
  children: 'children'
})

// ----- 获取分类列表 -----
let getCategoriesFlag = 1
const categoryObjs = ref({})
const getCategories = async () => {
  getCategoriesFlag--
  if (getCategoriesFlag >= 0) {
    const { categories } = await Apis.ledger.category.getCategories().then(res => {
      if (res && res.success) {
        console.log('成功获取类别列表')
        return res.data
      } else {
        console.log('获取记账类别失败')
        ElMessage.error(res && res.message ? res.message : '获取记账类别失败')
      }
    })

    categoryObjs.value = {}
    for (let i = 0; i < categories.length; i++) {
      categoryObjs.value[categories[i].id] = categories[i]
    }
  }
  getCategoriesFlag++
}
const getCategoryName = id => {
  if (id != null && categoryObjs.value[id] != null) {
    return categoryObjs.value[id].name
  }
  return ''
}

// ----- 获取动账账户列表 -----
let getAccountsFlag = 1
const accountList = ref([])
const accountObjs = ref({})
const getAccounts = async () => {
  getAccountsFlag--
  if (getAccountsFlag >= 0) {
    const { accounts } = await Apis.ledger.account.getAccounts().then(res => {
      if (res && res.success) {
        console.log('成功获取动账账户列表')
        return res.data
      } else {
        console.log('获取动账账户失败')
        ElMessage.error(res && res.message ? res.message : '获取动账账户失败')
      }
    })

    accountList.value = accounts
    accountObjs.value = {}
    for (let i = 0; i < accounts.length; i++) {
      accountObjs.value[accounts[i].id] = accounts[i]
    }
  }
  getAccountsFlag++
}
const getAccountName = id => {
  if (id != null && accountObjs.value[id] != null) {
    return accountObjs.value[id].name
  }
  return ''
}

// ---------- 条件查询记账明细分页数据渲染表格 ----------
const getListByPageConditionally = async (num, size, condition) => {
  // 注意：num是服务器页码，下标从0开始
  condition.pageNum = num
  condition.pageSize = size
  return Apis.ledger.journal.getJournalsByPageConditionally(condition).then(res => {
    if (res && res.success) {
      console.log('成功获取记账明细分页数据')
      return res.data
    } else {
      console.log('获取记账明细失败')
      ElMessage.error(res && res.message ? res.message : '获取记账明细失败')
    }
  })
}
const getList = async (num, size) => {
  console.groupCollapsed('条件查询记账明细分页数据')
  loading.value = true

  getCategoryTree()
  getCategories()
  getAccounts()

  const condition = {
    stDate: searchForm.value.dateRange != null ? searchForm.value.dateRange[0] : null,
    edDate: searchForm.value.dateRange != null ? searchForm.value.dateRange[1] : null,
    type: searchForm.value.type != null && searchForm.value.type.length > 0 ? searchForm.value.type : null,
    categoryId: searchForm.value.categoryId,
    accountId: searchForm.value.accountId,
    description: searchForm.value.description
  }
  const { pageNum, pageSize, totalPages, totalElements, journals } = await getListByPageConditionally(num - 1, size, condition) // 注意：服务器页码，下标从0开始
  console.log('渲染记账明细表格')
  formerPageSize.value = formPageSize.value
  formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
  formPageSize.value = pageSize
  formTotalPages.value = totalPages
  formTotalElements.value = totalElements
  formList.value = journals

  loading.value = false
  console.groupEnd()
}

// ---------- 刷新表格 ----------
const refresh = async () => {
  await getList(formPageNum.value, formPageSize.value)
  getSumConditionally()
  ElMessage.success('刷新完成')
}

// ---------- 搜索 ----------
const onSearch = async () => {
  Storage.set(SEARCH_FORM, searchForm.value)
  await getList(1, formPageSize.value)
  getSumConditionally()
  ElMessage.success('搜索完成')
}

// ---------- 分页器改变页码大小 ----------
// 为了在改变分页大小后，依然显示当前浏览的数据，需要对新页码进行计算
const onSizeChange = () => {
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

// ----- 账本按钮 -----
const MODE_SELECTED = 'ledger.detail.modeSelected'
const modeSelected = ref(Storage.get(MODE_SELECTED) != null ? Storage.get(MODE_SELECTED) : 1) // 0-总帐本，1-本月账本，2-上月账本
const btnType = ref(['primary', 'default', 'default'])
const btnBg = ref([true, false, false])
const onSelectMode = mode => {
  // 清空按钮状态
  btnType.value[0] = btnType.value[1] = btnType.value[2] = 'default'
  btnBg.value[0] = btnBg.value[1] = btnBg.value[2] = false
  // 记录所选模式
  modeSelected.value = mode
  Storage.set(MODE_SELECTED, mode)
  // 选中按钮
  btnType.value[mode] = 'primary'
  btnBg.value[mode] = true
  // 根据模式初始化/重置日期范围
  if (mode === 0) {
    // 总帐本
    searchForm.value.dateRange = null
    Storage.delete(SEARCH_FORM)
  } else if (mode === 1) {
    // 本月帐本
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const stDate = new Date(year, month - 1, 1)
    const edDate = new Date(year, month - 1, getDaysOfMonth(year, month))
    searchForm.value.dateRange = [stDate, edDate]
    Storage.set(SEARCH_FORM, searchForm.value)
  } else if (mode === 2) {
    // 上月帐本
    const now = new Date()
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const month = now.getMonth() === 0 ? 12 : now.getMonth() - 1 + 1
    const stDate = new Date(year, month - 1, 1)
    const edDate = new Date(year, month - 1, getDaysOfMonth(year, month))
    searchForm.value.dateRange = [stDate, edDate]
    Storage.set(SEARCH_FORM, searchForm.value)
  }
  getList(formPageNum.value, formPageSize.value)
  getSumConditionally()
}
onSelectMode(modeSelected.value)

// ---------- 重置 ----------
const reset = () => {
  searchForm.value = {
    dateRange: null,
    type: null,
    categoryId: null,
    accountId: null,
    description: null
  }
  searchFormRef.value.resetFields()
  Storage.delete(SEARCH_FORM)

  formPageNum.value = 1
  onSelectMode(modeSelected.value)
}

const showDrawer = ref(false)
const drawerTitle = ref('')
const drawerData = ref(null)
const drawerSaveCallback = ref()
const onCloseDrawer = () => {
  showDrawer.value = false
  drawerData.value = null
}
// ---------- 记账 ----------
const onAdd = () => {
  drawerTitle.value = '记账'
  drawerSaveCallback.value = addCallback
  showDrawer.value = true
}
const addCallback = async input => {
  await Apis.ledger.journal.addJournal(input).then(async res => {
    if (res && res.success) {
      ElMessage.success('记账成功')
      showDrawer.value = false
      await getList(1, formPageSize.value)
      currRowKey.value = res.data.journal.id
      getSumConditionally()
    } else {
      console.log('记账失败')
      ElMessage.error(res && res.message ? res.message : '记账失败')
    }
  })
}
// ---------- 编辑 ----------
const onEdit = row => {
  drawerTitle.value = '编辑'
  drawerData.value = row
  drawerSaveCallback.value = editCallback
  showDrawer.value = true
}
const editCallback = async input => {
  await Apis.ledger.journal.editJournal(input).then(async res => {
    if (res && res.success) {
      ElMessage.success('成功修改记账明细')
      showDrawer.value = false
      await getList(formPageNum.value, formPageSize.value)
      currRowKey.value = res.data.journal.id
      getSumConditionally()
    } else {
      console.log('修改记账明细失败')
      ElMessage.error(res && res.message ? res.message : '修改记账明细失败')
    }
  })
}

// ---------- 删除 ----------
const onDelete = row => {
  Apis.ledger.journal.deleteJournal(row.id).then(res => {
    if (res && res.success) {
      ElMessage.success('成功删除记账明细')
      getList(formPageNum.value, formPageSize.value)
      getSumConditionally()
    } else {
      console.log('删除记账明细失败')
      ElMessage.error(res && res.message ? res.message : '删除记账明细失败')
    }
  })
}

// ---------- 张开/收起详细查询 ----------
const SEARCH_EXPAND = 'ledger.detail.searchExpand'
const expand = ref(false)
const searchBoxDisplay = ref('none')
const tableHeightSub = ref('21.9rem')
const onExpand = () => {
  expand.value = !expand.value
  searchBoxDisplay.value = expand.value ? 'block' : 'none'
  tableHeightSub.value = expand.value ? '32.3rem' : '21.9rem'

  if (expand.value) {
    if (isEmpty(categoryTree.value)) {
      getCategoryTree()
    }
    if (isEmpty(accountList.value)) {
      getAccounts()
    }
  } else {
    reset()
  }
}
const initExpand = () => {
  const searchExpand = Storage.get(SEARCH_EXPAND)
  if (searchExpand != null && searchExpand === true && expand.value === false) {
    onExpand()
  }
}
initExpand()
watch(
  () => expand.value,
  (value, oldValue) => {
    Storage.set(SEARCH_EXPAND, value)
  },
  { immediate: true }
)

/**
 * 监听按钮栏、条件搜索框DOM组件高度
 * 动态渲染表格高度
 */
const btnAreaHeight = ref('0rem')
const searchBoxHeight = ref('0rem')
onMounted(() => {
  const btnAreaDOM = document.getElementsByClassName('btn-area')[0]
  const btnAreaResizeObserver = new ResizeObserver(entries => {
    btnAreaHeight.value = '' + entries[0].contentRect.height / 10 + 'rem'
  })
  btnAreaResizeObserver.observe(btnAreaDOM)

  const searchBoxDOM = document.getElementsByClassName('search-box-inline')[0]
  const searchBoxResizeObserver = new ResizeObserver(entries => {
    searchBoxHeight.value = '' + entries[0].contentRect.height / 10 + 'rem'
  })
  searchBoxResizeObserver.observe(searchBoxDOM)
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

        .btn-area {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;

          .btn-area-right {
            width: 38rem;
            margin-right: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .stat-box {
              display: flex;
              align-items: center;

              .stat-title {
                margin-left: 0.5rem;
                font-weight: bold;
              }
            }
          }
        }

        .search-box-inline {
          display: var(--search-box-display);

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
          // 减去按钮栏高度: 计算得到
          // 减去条件搜索框高度: 计算得到
          // 减去翻页组件高度: 4.4rem
          // 减去调整值: 6.7rem
          --btn-area-height: v-bind(btnAreaHeight);
          --search-box-height: v-bind(searchBoxHeight);
          height: calc(100vh - $--navbar-height - $--tagbar-height - var(--btn-area-height) - var(--search-box-height) - 4.4rem - 5.7rem);
        }

        .pagination-wrapper {
          padding-top: 2rem;
        }
      }
    }
  }
}
</style>
