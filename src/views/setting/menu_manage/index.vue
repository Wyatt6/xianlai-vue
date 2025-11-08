<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <el-button size="small" type="primary" :icon="Plus" v-perm="['menu:add']" @click="showAdd = true" :loading="loading">新增</el-button>
        <el-button size="small" type="success" :icon="Refresh" @click="refresh()" :loading="loading">刷新</el-button>
        <el-button size="small" :icon="Refresh" @click="reloadCache()">重载菜单缓存</el-button>
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
            <el-table-column label="菜单ID" prop="id" min-width="280" />
            <el-table-column label="排序ID" align="center" prop="sortId" min-width="140" />
            <el-table-column label="图标" align="center" prop="icon" min-width="60">
              <template #default="scope">
                <div v-if="scope.row.icon" class="icon-wrap">
                  <el-icon v-if="scope.row.icon.includes('el-icon')" size="1.8rem">
                    <component :is="menu.icon.substring(8, menu.icon.length)" />
                  </el-icon>
                  <LocalIcon v-else class="custom-icon" :name="scope.row.icon" size="1.8rem" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="菜单标题" prop="title" min-width="200" />
            <el-table-column label="状态" align="center" prop="active" min-width="85">
              <template #default="scope">
                <el-tag :type="scope.row.active ? 'success' : 'danger'">
                  {{ scope.row.active ? '生效' : '未生效' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="访问路径名称" prop="pathName" min-width="245" />
            <el-table-column label="非公开" align="center" prop="needPermission" min-width="70">
              <template #default="scope">
                <div class="icon-wrap">
                  <LocalIcon v-if="scope.row.needPermission" class="custom-icon" name="ri-check-line" size="1.8rem" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="所需权限标识" prop="permission" min-width="245" />
            <el-table-column label="操作" align="center" width="100" fixed="right" v-perm="['menu:edit', 'menu:delete']">
              <template #default="scope">
                <el-button-group size="small">
                  <el-button v-perm="['menu:edit']" :icon="Edit" plain @click="onEdit(scope.row)" />
                  <el-button v-perm="['menu:delete']" :icon="Delete" type="danger" @click="onDelete(scope.row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    <AddMenu :show="showAdd" :menus="formList" :paths="pathList" :perms="permList" @close="showAdd = false" @afterAdd="afterAdd" />
    <EditMenu
      :show="showEdit"
      :menus="formList"
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
import AddMenu from './AddMenu.vue'
import EditMenu from './EditMenu.vue'
import { useApiStore } from '@/apis'
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
      console.log('获取路径列表失败')
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
      console.log('获取权限列表失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取权限列表失败')
    }
  })
}

/**
 * 获取菜单森林
 */
async function getForest() {
  let success = false
  if (!loading.value) {
    loading.value = true
    initPathList()
    initPermList()
    await Api.request.common.menu
      .getForest()
      .then(result => {
        if (result && result.success) {
          console.log('成功获取菜单列表分页数据，渲染表格')
          formList.value = result.data.menus
          success = true
        } else {
          console.log('获取菜单列表失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取菜单列表失败')
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
 * 重载菜单缓存
 */
function reloadCache() {
  Api.request.common.menu.reloadCache().then(result => {
    if (result && result.success) {
      ElMessage.success('重载菜单缓存完成')
    } else {
      console.log('重载菜单缓存失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '重载菜单缓存失败')
    }
  })
}

/**
 * 修改菜单
 */
const showEdit = ref(false)
const nowRow = ref({})
function onEdit(row) {
  showEdit.value = true
  nowRow.value = row
}
// 编辑菜单后处理，回显数据
async function afterEdit(menu) {
  await getForest()
  currRowKey.value = menu.id
}

/**
 * 删除菜单
 * @param row 当前行
 */
function onDelete(row) {
  const { id, title, children } = row
  if (notEmpty(children)) {
    ElMessageBox.alert('当前菜单仍然包含子菜单，无法删除。', '删除菜单', { type: 'warning', dangerouslyUseHTMLString: true })
  } else {
    const message = '删除后数据不可恢复！<br>是否删除菜单【' + title + '】？'
    ElMessageBox.confirm(message, '删除菜单', { type: 'warning', dangerouslyUseHTMLString: true })
      .then(() => {
        Api.request.common.menu.delete({ menuId: id }).then(result => {
          if (result && result.success) {
            const succMesg = '成功删除菜单【' + title + '】'
            ElMessage.success(succMesg)
            getForest()
          } else {
            console.log('删除菜单失败')
            ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '删除菜单失败')
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
