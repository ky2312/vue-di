import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

import {globalContainer} from 'di'
import UserModel from './models/UserModel'
import UserService from './services/UserService'

globalContainer.register({
  UserModel, 
  UserService,
})

import App from './App.vue'
import router from './router'

import './assets/main.css'

Vue.use(PiniaVuePlugin)

new Vue({
  router,
  pinia: createPinia(),
  render: (h) => h(App)
}).$mount('#app')
