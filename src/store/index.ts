import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"
import { getModule } from 'vuex-module-decorators'

import AuthModule from "./auth"
import AppModule from "./app"
import EquipmentModule from "./equip"
import UserModule from "./user"

Vue.use(Vuex)

const persistOptions = () => {
  return { paths: ["AuthModule"] }
}

const store = new Vuex.Store({
  plugins: [createPersistedState(persistOptions())],
  modules: {
    AuthModule,
    AppModule,
    EquipmentModule,
    UserModule
  }
})

export default store
export const authStore = getModule(AuthModule, store)
export const appStore = getModule(AppModule, store)
export const equipStore = getModule(EquipmentModule, store)
export const userStore = getModule(UserModule, store)
