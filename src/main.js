import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 有坑：样式的引入需要放在前面
import ElementPlus from 'element-plus'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import installIcons from './plugins/icons' // 引入图标注册函数
import installDirectives from './plugins/directives' // 引入自定义指令

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCN })
app.use(createPinia())
app.use(router)
installIcons(app)
installDirectives(app)

// app.mount('#app')
