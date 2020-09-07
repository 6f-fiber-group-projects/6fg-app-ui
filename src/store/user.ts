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

  get getUserById() {
    return (id: number) => this.users.filter((u: UserInfo) => u.id === id)[0]
  }

  @Mutation
  setUsers(users: UserInfo[]) {
    console.log("setUsers", users)
    this.users = users
  }

  @Action({ rawError: true, commit: "setUsers" })
  async fetchUsers() {
    const res = await api.getUser()
    return res.data.message
  }
}