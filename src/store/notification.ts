import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { Notification } from "../models/index"
import store from "@/store/index"
import _ from "lodash"

@Module({ store, name: 'notification' })
export default class NotificationModule extends VuexModule {
  private list: Notification[] = []

  get getNotifications() {
    return this.list
  }

  @Mutation
  update(list: Notification[]) {
    this.list = list
  }

  @Action({ rawError: true, commit: "update" })
  error(msg: string): Notification[] {
    const n = new Notification({
      id: new Date().valueOf(),
      timeout: 0,
      type: "error",
      msg
    })
    return [...this.getNotifications, n]
  }

  @Action({ rawError: true, commit: "update" })
  info(msg: string): Notification[] {
    const n = new Notification({
      id: new Date().valueOf(),
      timeout: 3000,
      type: "info",
      msg
    })
    return [...this.getNotifications, n]
  }

  @Action({ rawError: true, commit: "update" })
  remove(id: number): Notification[] {
    return _.filter(this.getNotifications, obj => obj.id !== id)
  }
}
