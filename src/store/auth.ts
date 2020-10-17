import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import { LoginInfo } from '@/models/types'
import router from "@/router"
import store from "@/store/index"
import { appStore } from "@/store/index"
import api from "@/api"

@Module({ store, name: 'auth' })
export default class AuthModule extends VuexModule {
  private userInfo: UserInfo | null = null

  get isLogin() {
    return this.userInfo != null
  }

  get getUserInfo() {
    return this.userInfo
  }

  @Mutation
  setUserInfo(userInfo: UserInfo | null) {
    console.log("setUserInfo: ", userInfo) 
    this.userInfo = userInfo
  }

  @Action({ rawError: true })
  async login(params: LoginInfo) {
    await api.login(params)
    .then(d => this.context.commit("setUserInfo", new UserInfo(d.data.message)))
    .then(() => appStore.info("Successfully login"))
    .catch(() => {
      appStore.error("Failed to login")
      return Promise.reject("Failed to login")
    })
  }

  @Action({ rawError: true })
  async logout() {
    await api.logout()
    .finally(() => {
      this.context.commit("setUserInfo", null)
      router.push("/login")
    })
  }
}