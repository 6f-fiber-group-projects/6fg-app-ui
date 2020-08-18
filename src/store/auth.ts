import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import axios from "axios"

@Module
export default class Auth extends VuexModule {
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

  @Action
  async login(params: {email: string; password: string}) {
    await axios.post("auth", params)
    .then(d => this.context.commit("setUserInfo", new UserInfo(d.data.message)))
    .catch(e => console.log(e))
  }

  @Action({ commit: "setUserInfo" })
  async logout() {
    await axios.post("auth/logout")
    return null
  }
}
