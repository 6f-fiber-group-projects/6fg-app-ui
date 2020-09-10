import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import router from "@/router"
import store from "@/store/index"
import { notificationStore } from "@/store/index"
import axios from "axios"

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
  async login(params: {email: string; password: string}) {  
    await axios.post("auth", params)
    .then(d => this.context.commit("setUserInfo", new UserInfo(d.data.message)))
    .then(() => notificationStore.info("Successfully login"))
    .catch(() => {
      notificationStore.error("Failed to login")
      return Promise.reject("Failed to login")
    })
  }

  @Action({ rawError: true })
  async logout() {
    await axios.get("auth/logout")
    .then(() => notificationStore.info("Successfully logout"))
    .catch((e) => console.log(e))
    .finally(() => {
      this.context.commit("setUserInfo", null)
      router.push("/")
    })
  }
}