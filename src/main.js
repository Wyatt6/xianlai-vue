// 有坑：样式的引入需要放在前面
import ElementPlus from 'element-plus'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import installDirectives from './plugins/directives' // 引入自定义指令
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSystemStore } from './stores/system'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCN })
app.use(createPinia())
installDirectives(app)

const systemStore = useSystemStore()
await systemStore.initialize(app)
