import ElementPlus from 'element-plus'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useSystemStore } from './stores/system'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCN })
app.use(createPinia())
app.use(router)

const systemStore = useSystemStore()
await systemStore.initialize(app)
