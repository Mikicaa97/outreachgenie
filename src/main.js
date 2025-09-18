import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from "@/router/router.js"
import { i18n } from "@/i18n.js"

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(Toast, {
    position: POSITION.TOP_CENTER,
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    hideProgressBar: false,
})

app.mount('#app')
