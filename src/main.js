// 有坑：样式的引入需要放在前面
import ElementPlus from 'element-plus'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import installDirectives from './directives' // 引入自定义指令
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSystemStore } from './stores/system'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCN })
app.use(createPinia())

// 全局注册ElementPlus提供的图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 全局注册自定义指令
installDirectives(app)

useSystemStore().initialize(app)
