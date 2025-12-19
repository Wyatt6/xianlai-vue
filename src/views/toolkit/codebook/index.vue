<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <div class="top-row-wrap">
          <div style="display: flex; align-items: center">
            <el-button size="small" type="primary" :loading="loading" :icon="Plus" v-perm="['role:add']" @click="showAdd = true">新增</el-button>
            <el-button size="small" type="success" :loading="loading" :icon="Refresh" @click="refresh()">刷新</el-button>
            <span class="warning-text">请不要保存任何未经加密处理的密码、密钥等敏感信息！！</span>
          </div>
          <div style="display: flex; align-items: center">
            <el-text>加密解密程序下载：</el-text>
            <el-link type="primary" target="_blank" href="https://github.com/Wyatt6/xianlai-pwutil">Github</el-link>
            <span>&nbsp;&nbsp;</span>
            <el-link type="primary" target="_blank" href="https://gitee.com/wyatt6/xianlai-pwutil">Gitee</el-link>
          </div>
        </div>
        <el-form
          class="search-box-inline"
          :inline="true"
          size="small"
          label-position="right"
          label-width="4rem"
          ref="searchFormRef"
          :model="searchForm"
        >
          <el-form-item label="分组" prop="category">
            <el-input v-model="searchForm.category" clearable />
          </el-form-item>
          <el-form-item label="名称" prop="title">
            <el-input v-model="searchForm.title" clearable />
          </el-form-item>
          <el-form-item>
            <el-button :icon="Search" :loading="loading" @click="onSearch()">搜索</el-button>
            <el-button :icon="Brush" :loading="loading" @click="reset()">重置</el-button>
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
            <el-table-column label="序号" align="center" min-width="60" type="index" :index="getIndex" />
            <el-table-column label="分组" prop="category" min-width="100" />
            <el-table-column label="名称" prop="title" min-width="200" />
            <el-table-column label="用户名" prop="username" min-width="200" />
            <el-table-column label="加密密码" prop="code" min-width="250" />
            <el-table-column label="密钥提示" prop="tips" min-width="120" />
            <el-table-column label="双因子" align="center" min-width="80">
              <template #default="scope">
                <el-tag :type="scope.row.twoFAS ? 'success' : 'danger'">
                  {{ scope.row.twoFAS ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="绑定AppleID" align="center" min-width="80">
              <template #default="scope">
                <el-tag :type="scope.row.appleId ? 'success' : 'danger'">
                  {{ scope.row.appleId ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="绑定微信" align="center" min-width="80">
              <template #default="scope">
                <el-tag :type="scope.row.wechat ? 'success' : 'danger'">
                  {{ scope.row.wechat ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="绑定支付宝" align="center" min-width="80">
              <template #default="scope">
                <el-tag :type="scope.row.alipay ? 'success' : 'danger'">
                  {{ scope.row.alipay ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="手机" prop="phone" min-width="160" />
            <el-table-column label="电子邮箱" prop="email" min-width="250" />
            <el-table-column label="排序ID" align="center" prop="sortId" min-width="80" />
            <el-table-column label="备注" prop="remark" min-width="320" />
            <el-table-column label="操作" align="center" width="100" fixed="right">
              <template #default="scope">
                <el-button-group size="small">
                  <el-button :icon="Edit" plain @click="onEdit(scope.row)" />
                  <el-button :icon="Delete" type="danger" @click="onDelete(scope.row)" />
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
    </div>
    <AddSecretCode :show="showAdd" @close="showAdd = false" @afterAdd="afterAdd" />
    <EditSecretCode :show="showEdit" :nowRow="nowRow" @close="showEdit = false" @afterEdit="afterEdit" />
  </div>
</template>

<script setup>
import AddSecretCode from './AddSecretCode.vue'
import EditSecretCode from './EditSecretCode.vue'
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Brush, Edit, Delete } from '@element-plus/icons-vue'
import Storage from '@/utils/storage'
import { notEmpty } from '@/utils/common'
import { useApiStore } from '@/apis'

const Api = useApiStore()

// ---------- 搜索表单数据定义 ----------
const SEARCHED_KEY = 'toolkit.codebook.searched'
const SEARCH_FORM_KEY = 'toolkit.codebook.searchForm'
const searched = ref(Storage.get(SEARCHED_KEY) || false)
const searchFormRef = ref()
const deafultSearchForm = {
  category: null,
  title: null
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
const PAGE_NUM_KEY = 'toolkit.codebook.pageNum'
const PAGE_SIZE_KEY = 'toolkit.codebook.pageSize'
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
      category: searchForm.value.category,
      title: searchForm.value.title
    }
    console.log('条件查询密码本分页数据')
    Api.request.toolkit.codebook
      .getPageConditionally({ pageNum: num - 1, pageSize: size }, condition) // 注意：服务器页码，下标从0开始，所以-1
      .then(result => {
        if (result && result.success) {
          console.log('成功获取密码本分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, content } = result.data
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = content
          success = true
        } else {
          console.log('获取密码本失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取密码本失败')
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
  if (notEmpty(searchForm.value.category)) searched.value = true
  if (notEmpty(searchForm.value.title)) searched.value = true
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
 * 新增密码条目
 */
const showAdd = ref(false)
async function afterAdd(secretCode, rowNum) {
  searchForm.value = deafultSearchForm
  searched.value = false
  searchFormRef.value.resetFields()
  // 查询新角色所在分页
  formPageNum.value = Math.floor((rowNum - 1) / formPageSize.value) + 1
  await getList(formPageNum.value, formPageSize.value)
  // 选中最新增加的角色记录
  currRowKey.value = secretCode.id
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
 * 编辑密码条目
 */
const showEdit = ref(false)
function onEdit(row) {
  showEdit.value = true
  nowRow.value = row
}
// 编辑密码条目后处理，回显数据
function afterEdit(secretCode) {
  for (let i = 0; i < formList.value.length; i++) {
    if (secretCode.id === formList.value[i].id) {
      formList.value[i].sortId = secretCode.sortId
      formList.value[i].category = secretCode.category
      formList.value[i].title = secretCode.title
      formList.value[i].username = secretCode.username
      formList.value[i].code = secretCode.code
      formList.value[i].tips = secretCode.tips
      formList.value[i].twoFAS = secretCode.twoFAS
      formList.value[i].appleId = secretCode.appleId
      formList.value[i].wechat = secretCode.wechat
      formList.value[i].alipay = secretCode.alipay
      formList.value[i].phone = secretCode.phone
      formList.value[i].email = secretCode.email
      formList.value[i].remark = secretCode.remark
      break
    }
  }
  currRowKey.value = secretCode.id
}

/**
 * 删除密码条目
 * @param row 当前行
 */
function onDelete(row) {
  const { id, category, title } = row
  const message = '删除后数据不可恢复！<br>请确认是否删除密码条目【' + (notEmpty(category) ? category + ' / ' : '') + title + '】？'
  ElMessageBox.confirm(message, '删除密码条目', { type: 'warning', dangerouslyUseHTMLString: true })
    .then(() => {
      Api.request.toolkit.codebook.delete({ secretCodeId: id }).then(result => {
        if (result && result.success) {
          const succMesg = '成功删除密码条目【' + (notEmpty(category) ? category + ' / ' : '') + title + '】'
          ElMessage.success(succMesg)
          getList(formPageNum.value, formPageSize.value)
        } else {
          console.log('删除密码条目失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '删除密码条目失败')
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

      .top-row-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .warning-text {
          margin-left: 5rem;
          color: #f56c6c;
          font-size: 1.8rem;
          font-weight: 600;
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
        // 减去加密解密程序下载链接高度: 2.4rem
        // 减去翻页组件高度: 4.4rem
        // 减去调整值: 6.7rem
        // 减去条件搜索框高度: 计算得到
        --search-box-height: v-bind(searchBoxHeight);
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 2.4rem - 3.1rem - 4.4rem - 6.7rem - var(--search-box-height));
      }

      .pagination-wrap {
        padding-top: 2rem;
      }
    }
  }
}
</style>
