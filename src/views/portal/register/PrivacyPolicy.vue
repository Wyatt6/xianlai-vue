<template>
  <el-dialog :model-value="show" center width="60%" @close="onClose">
    <el-scrollbar height="43rem">
      <div>
        <h2>隐私保护（个人信息保护）政策</h2>
      </div>
      <div v-html="Option.data.content.privacyPolicy"></div>
    </el-scrollbar>
    <template #footer>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useOptionStore } from '@/stores/option'

const Option = useOptionStore()

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
