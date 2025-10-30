<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
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
          >
            <el-table-column label="序号" align="center" width="55" type="index" :index="getIndex" />
            <el-table-column label="接口说明" prop="description" width="250" />
            <el-table-column label="调用路径" prop="callPath" width="330" />
            <el-table-column label="请求方法" align="center" prop="requestMethod" width="85" />
            <el-table-column label="请求URL" prop="url" />
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useApiStore } from '@/apis'
import Storage from '@/utils/storage'
import Logger from '@/utils/logger'

const Api = useApiStore()

// ---------- 表格数据定义 ----------
const PAGE_NUM_KEY = 'setting.api_manage.pageNum'
const PAGE_SIZE_KEY = 'setting.api_manage.pageSize'
const pageSizeList = ref([20, 50, 100, 500])
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
 * 条件查询接口列表分页数据渲染表格
 * @param num 页码（注意：num是服务器页码，下标从0开始）
 * @param size 分页大小
 */
async function getList(num, size) {
  let success = false
  if (!loading.value) {
    loading.value = true
    // const condition = {
    //   identifier: searchForm.value.identifier,
    //   name: searchForm.value.name,
    //   description: searchForm.value.description
    // }
    Logger.log('条件查询接口列表分页数据')
    await Api.request.common.api
      .getPageConditionally({ pageNum: num - 1, pageSize: size }, null) // 注意：服务器页码，下标从0开始，所以-1
      .then(result => {
        if (result && result.success) {
          Logger.log('成功获取接口列表分页数据，渲染表格')
          const { pageNum, pageSize, totalPages, totalElements, content } = result.data
          console.log(result.data)
          formerPageSize.value = formPageSize.value
          formPageNum.value = pageNum + 1 // 注意：自然页码，下标从1开始
          formPageSize.value = pageSize
          formTotalPages.value = totalPages
          formTotalElements.value = totalElements
          formList.value = content
          success = true
        } else {
          Logger.log('获取接口列表失败')
          ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '获取接口列表失败')
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

      .table-wrap {
        width: 100%;
        // 全屏高度: 100vh
        // 减去Navbar高度: $navbar-height
        // 减去Tagbar高度: $tagbar-height
        // 减去新增、刷新按钮高度: 2.4rem
        // 减去翻页组件高度: 4.4rem
        // 减去调整值: 6.7rem（含搜索框margin-top 2rem）
        // 减去条件搜索框高度: 计算得到
        --search-box-height: v-bind(searchBoxHeight);
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 4.4rem - 4.7rem - var(--search-box-height));
      }

      .pagination-wrap {
        padding-top: 2rem;
      }
    }
  }
}
</style>
