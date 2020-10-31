import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { Notification } from "../models/index"
import store from "@/store/index"
import _ from "lodash"

@Module({ store, name: 'notification' })
export default class AppModule extends VuexModule {
  private notifications: Notification[] = []
  private loading = false

  get getNotifications() {
    return this.notifications
  }

  get isLoading() {
    return this.loading
  }

  @Mutation
  updateNotifications(notifications: Notification[]) {
    this.notifications = notifications
  }

  @Mutation
  onLoading(){
    this.loading = true
  }

  @Mutation
  offLoading(){
    this.loading = false
  }

  @Action({ rawError: true, commit: "updateNotifications" })
  error(msg: string): Notification[] {
    const n = new Notification({
      id: new Date().valueOf(),
      timeout: 0,
      type: "error",
      msg
    })
    return [...this.getNotifications, n]
  }

  @Action({ rawError: true, commit: "updateNotifications" })
  info(msg: string): Notification[] {
    const n = new Notification({
      id: new Date().valueOf(),
      timeout: 3000,
      type: "info",
      msg
    })
    return [...this.getNotifications, n]
  }

  @Action({ rawError: true, commit: "updateNotifications" })
  remove(id: number): Notification[] {
    return _.filter(this.getNotifications, obj => obj.id !== id)
  }
}
