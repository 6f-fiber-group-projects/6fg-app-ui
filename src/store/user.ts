import { Module, VuexModule, Mutation, Action, } from "vuex-module-decorators"
import { UserInfo } from "../models/index"
import { User } from '@/models/types'
import store from "@/store/index"
import api from "@/api"
import _ from "lodash"

@Module({ store, name: 'UserModule', namespaced: true  })
export default class UserModule extends VuexModule {
  private users: UserInfo[] = []
  private subscribeId = 0

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

  @Mutation
  subscribeUsers() {
    this.subscribeId = setInterval(() => store.dispatch("UserModule/fetchUsers"), 5000)
  }

  @Mutation
  unsubscribeUsers() {
    if(this.subscribeId != 0)  clearInterval(this.subscribeId)
    this.subscribeId = 0
  }

  @Action({ rawError: true, commit: "setUsers" })
  async fetchUsers() {
    const res = await api.getUser()
    return res.data.message
  }

  @Action({ rawError: true })
  subscribe() {
    this.unsubscribeUsers()
    this.subscribeUsers()
  }

  @Action({ rawError: true })
  unsubscribe() {
    this.unsubscribeUsers()
  }
}