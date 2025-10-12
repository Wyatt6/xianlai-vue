<template>
  <SvgIcon v-if="svgCode.length > 0" :src="svgCode" color-transition="0s" />
</template>

<script setup>
/**
 * 本地图标组件
 * 基于vite-awesome-svg-loader插件中的SvgIcon组件封装，通过图标名称来使用本地图标
 * 图标svg文件保存于@/assets/icons目录下
 * 组件属性：
 *   - name             图标名称（不用带.svg后缀）
 *   - color            继承自SvgIcon，控制图标颜色
 *   - colorTransition  继承自SvgIcon，控制图标颜色切换动画
 *   - size             继承自SvgIcon，控制图标尺寸
 *   - src              继承自SvgIcon，在本组件没有用
 */
import { ref, watch } from 'vue'
import { SvgIcon } from 'vite-awesome-svg-loader/vue-integration'
import { useSystemStore } from '@/stores/system'

const svgCode = ref('')

const props = defineProps({
  // 不需要这样引入，也能直接用SvgIcon自带的color等属性
  // ...SvgIcon.props,
  name: {
    type: String,
    required: true
  }
})

/**
 * 图标名称变更时的处理
 * 通过正则表达式判断目标图标文件，并解出svg代码赋值给svgCode进行渲染
 *
 * @param name 图标名称
 */
async function onNameChange(name) {
  const icons = useSystemStore().icons
  for (const path in icons) {
    const regexp = new RegExp('^.*/assets/icons/' + name + '.svg$')
    if (regexp.test(path)) {
      svgCode.value = (await icons[path]()).default
    }
  }
}

/**
 * 监听图标名称变动，达到动态变更效果
 */
watch(
  () => props.name,
  (value, oldValue) => onNameChange(value),
  { immediate: true }
)
</script>
