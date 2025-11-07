<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <el-button size="small" type="primary" :icon="Plus" v-perm="['option:add']" @click="showAdd = true">新增</el-button>
        <el-button size="small" type="success" :icon="Refresh" @click="refresh()">刷新</el-button>
        <el-button size="small" :icon="Refresh" @click="reloadCache()">重载参数缓存</el-button>
        <div class="tab-wrap" v-loading="loading">
          <el-tabs class="tabs" tab-position="left" type="border-card" v-model="tabsActiveName" @tab-click="onTabClick">
            <el-tab-pane class="tab-page" v-for="tab in tabCtrl" :label="tab.label" :name="tab.category">
              <el-scrollbar height="100%">
                <div v-for="(item, index) in formList[tab.category]">
                  <el-divider v-if="index > 0" />
                  <div class="option-title">
                    <span>{{ item.name }}</span>
                    <el-button-group style="margin-left: 2.5rem" size="small">
                      <el-button v-perm="['option:edit']" :icon="Edit" plain @click="onEdit(item)" />
                      <el-button v-perm="['option:delete']" :icon="Delete" type="danger" @click="onDelete(item)" />
                    </el-button-group>
                  </div>
                  <div class="option-sub-title" v-if="notEmpty(item.description)">
                    <span>{{ item.description }}</span>
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-title">Key:</span>
                    <el-text class="row-item-value" type="primary">{{ item.optionKey }}</el-text>
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-title">当前参数值:</span>
                    <el-text class="row-item-value" type="primary">{{ item.optionValue }}</el-text>
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-title">默认参数值:</span>
                    <el-text class="row-item-value" type="info">{{ item.defaultValue }}</el-text>
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-title">前端加载:</span>
                    <LocalIcon name="ri-checkbox-circle-fill" size="2rem" color="#67C23A" v-if="item.frontLoad" />
                    <LocalIcon name="ri-close-circle-fill" size="2rem" color="#F56C6C" v-else />
                    <span class="row-item-title" style="margin-left: 2.5rem" v-if="item.frontLoad">JS类型:</span>
                    <el-text class="row-item-value" type="info" v-if="item.frontLoad">{{ item.jsType }}</el-text>
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-title">后台加载:</span>
                    <LocalIcon name="ri-checkbox-circle-fill" size="2rem" color="#67C23A" v-if="item.backLoad" />
                    <LocalIcon name="ri-close-circle-fill" size="2rem" color="#F56C6C" v-else />
                  </div>
                  <div class="option-row">
                    <LocalIcon name="ri-arrow-right-s-fill" size="1.6rem" />
                    <span class="row-item-sub-title">参数ID:</span>
                    <span class="row-item-sub-title">{{ item.id }}</span>
                    <span class="row-item-sub-title" style="margin-left: 1.5rem">排序ID:</span>
                    <span class="row-item-sub-title">{{ item.sortId }}</span>
                  </div>
                </div>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
    <AddOption :show="showAdd" @close="showAdd = false" @afterAdd="afterAdd" />
    <EditOption :show="showEdit" :nowRow="nowRow" @close="showEdit = false" @afterEdit="afterEdit" />
  </div>
</template>

<script setup>
import LocalIcon from '@/components/LocalIcon/index.vue'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import AddOption from './AddOption.vue'
import EditOption from './EditOption.vue'
import { useApiStore } from '@/apis'
import { useOptionStore } from '@/stores/option'
import Storage from '@/utils/storage'
import Logger from '@/utils/logger'
import { notEmpty } from '@/utils/common'

const Api = useApiStore()
const Option = useOptionStore()

const ACTIVE_TAB = 'setting.option.activeTab'
const tabCtrl = ref(Option.data.option.categoryList)
const tabsActiveName = ref(Storage.get(ACTIVE_TAB) ? Storage.get(ACTIVE_TAB) : tabCtrl.value[0].category)
const formList = ref({}) // 初始分页列表
const loading = ref(false)

/**
 * 获取分类后的参数列表
 */
async function getList() {
  let success = false
  if (!loading.value) {
    loading.value = true
    await Api.request.common.option
      .getClassifiedList()
      .then(result => {
        if (result && result.success) {
          Logger.log('成功获取参数列表分页数据，渲染表格')
          formList.value = result.data.options
          success = true
        } else {
          Logger.log('获取参数列表失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取参数列表失败')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
  return success
}
getList()

/**
 * 新增参数
 */
const showAdd = ref(false)
async function afterAdd() {
  await getList()
}

/**
 * 刷新
 */
async function refresh() {
  const result = await getList()
  if (result) {
    ElMessage.success('刷新完成')
  }
}

/**
 * 重载参数缓存
 */
function reloadCache() {
  Api.request.common.option.reloadCache().then(result => {
    if (result && result.success) {
      ElMessage.success('重载参数缓存完成')
    } else {
      Logger.log('重载参数缓存失败')
      ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '重载参数缓存失败')
    }
  })
}

/**
 * 修改
 */
const showEdit = ref(false)
const nowRow = ref({})
function onEdit(row) {
  showEdit.value = true
  nowRow.value = row
}
// 编辑参数后处理，回显数据
async function afterEdit() {
  await getList()
}

/**
 * 删除参数
 */
function onDelete(item) {
  const { id, name } = item
  const message = '删除后数据不可恢复！可能影响系统正常运行！<br>是否删除参数【' + name + '】？'
  ElMessageBox.confirm(message, '删除参数', { type: 'warning', dangerouslyUseHTMLString: true })
    .then(() => {
      Api.request.common.option.delete({ optionId: id }).then(result => {
        if (result && result.success) {
          const succMesg = '成功删除参数【' + name + '】'
          ElMessage.success(succMesg)
          getList()
        } else {
          Logger.log('删除参数失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '删除参数失败')
        }
      })
    })
    .catch(() => {
      // 点击“取消”不做动作
    })
}

/**
 * 标签点击时缓存
 */
function onTabClick(item) {
  tabsActiveName.value = item.paneName
  Storage.set(ACTIVE_TAB, item.paneName)
}
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

      .tab-wrap {
        margin-top: 2rem;
        width: 100%;
        // 全屏高度: 100vh
        // 减去Navbar高度: $navbar-height
        // 减去Tagbar高度: $tagbar-height
        // 减去按钮高度: 2.4rem
        // 减去调整值: 6.7rem (含margin-top 2rem, margin-bottom 2rem)
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 2.4rem - 6.7rem);

        .tabs {
          width: 100%;
          height: 100%;

          .tab-page {
            margin-top: 1rem;
            margin-bottom: 1rem;
            width: 100%;
            height: calc(100% - 2rem);

            .option-title {
              font-size: 2.4rem;
              font-weight: 700;
              display: flex;
              align-items: center;
            }

            .option-sub-title {
              margin-top: 1rem;
              font-size: 1.4rem;
              color: var(--el-text-color-primary);
            }

            .option-row {
              margin-top: 1rem;
              display: flex;
              align-items: center;

              .row-item-title {
                font-size: 1.6rem;
                font-weight: 500;
                margin-right: 1rem;
              }

              .row-item-sub-title {
                font-size: 1.6rem;
                font-weight: 500;
                color: var(--el-text-color-secondary);
                margin-right: 1rem;
              }

              .row-item-value {
                font-size: 1.6rem;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}
</style>
