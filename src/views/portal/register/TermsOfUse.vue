<template>
  <el-dialog :model-value="show" center width="60%" @close="onClose">
    <el-scrollbar height="43rem">
      <div>
        <h2>使用条款</h2>
      </div>
      <div v-html="SysOption.data.content.termsOfUse"></div>
    </el-scrollbar>
    <template #footer>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useSysOptionStore } from '@/stores/sys_option'

const SysOption = useSysOptionStore()

defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  }
})
const emits = defineEmits(['close'])

/**
 * 关闭时调用父组件的事件
 */
function onClose() {
  emits('close')
}
</script>
