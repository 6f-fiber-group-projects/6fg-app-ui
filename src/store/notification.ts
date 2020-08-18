import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { Notification } from "../models/index"

@Module
export default class Auth extends VuexModule {
  notificatios: Notification[] = []

  @Mutation
  update(list: Notification[]) {
    this.notificatios = list
  }

  @Action({ rawError: true, commit: "update" })
  error(msg: string): Notification[] {
    const n = new Notification({
      id: new Date().valueOf(),
      timeout: 0,
      type: "error",
      msg
    })
    return [...this.notificatios, n]
  }
}
