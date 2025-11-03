<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <el-button size="small" type="primary" :icon="Plus" v-perm="['route:add']" @click="showAdd = true" :loading="loading">新增</el-button>
        <el-button size="small" type="success" :icon="Refresh" @click="refresh()" :loading="loading">刷新</el-button>
        <el-button size="small" :icon="Refresh" @click="reloadCache()">重载路由缓存</el-button>
        <div class="table-wrap">
          <el-table
            height="100%"
            stripe
            row-key="id"
            :row-style="tableRow()"
            highlight-current-row
            :data="formList"
            :current-row-key="currRowKey"
            v-loading="loading"
            border
            default-expand-all
          >
            <el-table-column label="路由名称(name属性)" prop="name" min-width="300" />
            <el-table-column label="路由ID" prop="id" min-width="200" />
            <el-table-column label="排序ID" align="center" prop="sortId" min-width="100" />
            <el-table-column label="路由路径(path属性)" prop="pathName" min-width="260" />
            <el-table-column label="路径重定向(redirect属性)" prop="redirectPathName" min-width="260" />
            <el-table-column label="组件相对路径(component属性)" prop="componentPath" min-width="300" />
            <el-table-column label="需登陆" align="center" prop="needLogin" min-width="70">
              <template #default="scope">
                <div class="icon-wrap">
                  <LocalIcon v-if="scope.row.needLogin" class="custom-icon" name="ri-check-line" size="1.8rem" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="需权限" align="center" prop="needPermission" min-width="70">
              <template #default="scope">
                <div class="icon-wrap">
                  <LocalIcon v-if="scope.row.needPermission" class="custom-icon" name="ri-check-line" size="1.8rem" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="所需权限标识" prop="permission" min-width="245" />
            <el-table-column label="显标签" align="center" prop="showTag" min-width="70">
              <template #default="scope">
                <div class="icon-wrap">
                  <LocalIcon v-if="scope.row.showTag" class="custom-icon" name="ri-check-line" size="1.8rem" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="显示标签标题" prop="tagTitle" min-width="200" />
            <el-table-column label="操作" align="center" width="100" fixed="right" v-perm="['route:edit', 'route:delete']">
              <template #default="scope">
                <el-button-group size="small">
                  <el-button v-perm="['route:edit']" :icon="Edit" plain @click="onEdit(scope.row)" />
                  <el-button v-perm="['route:delete']" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    <AddRoute :show="showAdd" :routes="formList" :paths="pathList" :perms="permList" @close="showAdd = false" @afterAdd="afterAdd" />
    <EditRoute
      :show="showEdit"
      :routes="formList"
      :paths="pathList"
      :perms="permList"
      :nowRow="nowRow"
      @close="showEdit = false"
      @afterEdit="afterEdit"
    />
  </div>
</template>

<script setup>
import LocalIcon from '@/components/LocalIcon/index.vue'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import AddRoute from './AddRoute.vue'
import EditRoute from './EditRoute.vue'
import { useApiStore } from '@/apis'
import Logger from '@/utils/logger'
import { notEmpty } from '@/utils/common'

const Api = useApiStore()

// ---------- 表格数据定义 ----------
const formList = ref([]) // 初始分页列表
const currRowKey = ref()
const loading = ref(false)

const pathList = ref([])
function initPathList() {
  Api.request.common.path.getPageConditionally({ pageNum: -1, pageSize: 0 }, null).then(result => {
    if (result && result.success) {
      pathList.value = result.data.content
    } else {
      Logger.log('获取路径列表失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取路径列表失败')
    }
  })
}

const permList = ref([])
function initPermList() {
  Api.request.iam.permission.getPageConditionally({ pageNum: -1, pageSize: 0 }, null).then(result => {
    if (result && result.success) {
      permList.value = result.data.content
    } else {
      Logger.log('获取权限列表失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取权限列表失败')
    }
  })
}

/**
 * 获取路由森林
 */
async function getForest() {
  let success = false
  if (!loading.value) {
    loading.value = true
    initPathList()
    initPermList()
    await Api.request.common.route
      .getForest()
      .then(result => {
        if (result && result.success) {
          Logger.log('成功获取路由列表分页数据，渲染表格')
          formList.value = result.data.routes
          success = true
        } else {
          Logger.log('获取路由列表失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取路由列表失败')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
  return success
}
getForest()

/**
 * 新增
 */
const showAdd = ref(false)
async function afterAdd(newObj) {
  await getForest()
  currRowKey.value = newObj.id
}

/**
 * 刷新
 */
async function refresh() {
  const result = await getForest()
  if (result) {
    ElMessage.success('表格刷新完成')
  }
}

/**
 * 重载路由缓存
 */
function reloadCache() {
  Api.request.common.route.reloadCache().then(result => {
    if (result && result.success) {
      ElMessage.success('重载路由缓存完成')
    } else {
      Logger.log('重载路由缓存失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '重载路由缓存失败')
    }
  })
}

/**
 * 修改路由
 */
const showEdit = ref(false)
const nowRow = ref({})
function onEdit(row) {
  showEdit.value = true
  nowRow.value = row
}
// 编辑路由后处理，回显数据
async function afterEdit(route) {
  await getForest()
  currRowKey.value = route.id
}

/**
 * 删除路由
 * @param row 当前行
 */
function onDelete(row) {
  const { id, title, children } = row
  if (notEmpty(children)) {
    ElMessageBox.alert('当前路由仍然包含子路由，无法删除。', '删除路由', { type: 'warning', dangerouslyUseHTMLString: true })
  } else {
    const message = '删除后数据不可恢复！<br>是否删除路由【' + title + '】？'
    ElMessageBox.confirm(message, '删除路由', { type: 'warning', dangerouslyUseHTMLString: true })
      .then(() => {
        Api.request.common.route.delete({ routeId: id }).then(result => {
          if (result && result.success) {
            const succMesg = '成功删除路由【' + title + '】'
            ElMessage.success(succMesg)
            getForest()
          } else {
            Logger.log('删除路由失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '删除路由失败')
          }
        })
      })
      .catch(() => {
        // 点击“取消”不做动作
      })
  }
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
// onMounted(() => {
//   const searchBoxDOM = document.getElementsByClassName('search-box-inline')[0]
//   const resizeObserver = new ResizeObserver(entries => {
//     searchBoxHeight.value = '' + entries[0].contentRect.height / 10 + 'rem'
//   })
//   resizeObserver.observe(searchBoxDOM)
// })
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
      width: 100%;
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
        margin-top: 2rem;
        // 全屏高度: 100vh
        // 减去Navbar高度: $navbar-height
        // 减去Tagbar高度: $tagbar-height
        // 减去新增、刷新按钮高度: 2.4rem
        // 减去翻页组件高度: 4.4rem
        // 减去调整值: 6.7rem（含表格margin-top 2rem）
        // 减去条件搜索框高度: 计算得到
        --search-box-height: v-bind(searchBoxHeight);
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 2.4rem - 6.7rem - var(--search-box-height));

        .icon-wrap {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .pagination-wrap {
        padding-top: 2rem;
      }
    }
  }
}
</style>
