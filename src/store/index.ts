import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"
import { getModule } from 'vuex-module-decorators'

import AuthModule from "./auth"
import NotificationModule from "./notification"
import EquipmentModule from "./equip"

Vue.use(Vuex)

const persistOptions = () => {
  return { paths: ["AuthModule"] }
}

const store = new Vuex.Store({
  plugins: [createPersistedState(persistOptions())],
  modules: {
    AuthModule,
    NotificationModule,
    EquipmentModule
  }
})

export default store
export const authStore = getModule(AuthModule, store)
export const notificationStore = getModule(NotificationModule, store)
export const equipStore = getModule(EquipmentModule, store)
