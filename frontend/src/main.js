import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import api from './api'

const app = createApp(App)

app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
})

// Dodaj interceptor do axiosa, by automatycznie dodawać token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Globalna ochrona tras (przykład)
router.beforeEach((to, from, next) => {
  const publicPages = ['/auth']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')
  if (authRequired && !token) {
    return next('/auth')
  }
  next()
})

app.mount('#app')
