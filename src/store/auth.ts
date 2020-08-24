import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import store from "@/store/index"
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
  }

  @Action({ rawError: true, commit: "setUserInfo" })
  async logout() {
    await axios.get("auth/logout")
    return null
  }
}