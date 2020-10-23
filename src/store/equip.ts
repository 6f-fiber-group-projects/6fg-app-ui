import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { EquipmentInfo } from "../models/index"
import store from "@/store/index"
import axios from "axios"
import _ from "lodash"

@Module({ store, name: 'EquipmentModule', namespaced: true })
export default class EquipModule extends VuexModule {
  private eqipsInfo: Array<EquipmentInfo> = []
  private subscribeId = 0

  get getEquipsInfo() {
    return this.eqipsInfo
  }

  @Mutation
  setEquipsInfo(equipsInfo: Array<EquipmentInfo>) {
    console.log("setEquipsInfo", equipsInfo)
    this.eqipsInfo = equipsInfo
  }

  @Mutation
  subscribeEquips() {
    this.subscribeId = setInterval(() => store.dispatch("EquipmentModule/fetchEquipsInfo"), 5000)
  }

  @Mutation
  unsubscribeEquips() {
    if(this.subscribeId !== 0) clearInterval(this.subscribeId)
    this.subscribeId = 0
  }

  @Action({ rawError: true })
  async fetchEquipsInfo() {
    await axios.get("equipment")
    .then(res => this.context.commit(
      "setEquipsInfo", 
      _.map(res.data.message, d => new EquipmentInfo(d))
    ))
  }

  @Action({ rawError: true })
  subscribe() {
    this.unsubscribeEquips()
    this.subscribeEquips()
  }

  @Action({ rawError: true })
  unsubscribe() {
    this.unsubscribeEquips()
  }
}