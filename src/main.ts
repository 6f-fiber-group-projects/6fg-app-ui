import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import axios from "axios"

// FIX ME
const responseHandler = (res: any) => res
const responseErrorHandler = (err: any) => {
  if (err.response.status == 401) store.commit("setUserInfo", null)
  return Promise.reject(err)
}

axios.defaults.baseURL = process.env.NODE_ENV === "production"
  ? "https://www.fgapi.work/"//"https://aqueous-hollows-30635.herokuapp.com/"
  : "http://localhost:8000/"
axios.defaults.withCredentials = true
axios.interceptors.response.use(responseHandler, responseErrorHandler)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')