import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"
import { getModule } from 'vuex-module-decorators'

import AuthModule from "./auth"
import NotificationModule from "./notification"

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {
    AuthModule,
    NotificationModule
  }
})

export default store
export const authStore = getModule(AuthModule, store)
export const notificationStore = getModule(NotificationModule, store)
