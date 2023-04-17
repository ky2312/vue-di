import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {globalContainer} from 'di'

import App from './App.vue'
import router from './router'
import { UserModel } from './models/UserModel'
import { UserService } from './services/UserService'

import './assets/main.css'

globalContainer.register({
  UserModel,
  UserService,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
