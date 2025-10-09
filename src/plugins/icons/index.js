/**
 * 全局注册ElementPlus提供的图标
 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 这个函数接收app实例作为参数
export default app => {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}
