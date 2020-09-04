import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import store from "@/store/index"
import api from "@/api"

@Module({ store, name: 'user' })
export default class UserModule extends VuexModule {
  private users: UserInfo[] = []

  get getUsers() {
    return this.users
  }

  @Mutation
  setUserInfo(users: UserInfo[]) {
    this.users = users
  }

  @Action({ rawError: true, commit: "setUsers" })
  async fetchUsers() {
    const res = await api.getUser()
    return res.data.message
  }
}