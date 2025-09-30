import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,

  // 自定义规则
  {
    name: 'custom config',
    rules: {
      'no-unused-vars': 'off', // 变量已定义但未使用
      'vue/multi-word-component-names': 'off' // 组件文件名要由多个单词组成
    }
  }
]
