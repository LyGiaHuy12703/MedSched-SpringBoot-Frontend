import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.vue'
import router from './router'
import VueToast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { registerLayouts } from './layouts/_register'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import '@mdi/font/css/materialdesignicons.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'vuestic-ui/styles/essential.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import html2pdf from 'html2pdf.js'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(VueToast)
app.use(createPinia())
app.use(createVuestic())
app.use(router)
app.use(pinia)

registerLayouts(app)
app.mount('#app')
