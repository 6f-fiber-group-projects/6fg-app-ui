import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import { User } from '@/models/types'
import store from "@/store/index"
import api from "@/api"
import _ from "lodash"

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
  setUsers(users: User[]) {
    console.log("setUsers", users)
    this.users = _.map(users, (u: User) => new UserInfo(u))
  }

  @Action({ rawError: true, commit: "setUsers" })
  async fetchUsers() {
    const res = await api.getUser()
    return res.data.message
  }
}