import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { EquipmentInfo } from "../models/index"
import store from "@/store/index"
import axios from "axios"
import _ from "lodash"

@Module({ store, name: 'equip' })
export default class EquipModule extends VuexModule {
  private eqipsInfo: Array<EquipmentInfo> = []

  get getEquipsInfo() {
    return this.eqipsInfo
  }

  @Mutation
  setEquipsInfo(equipsInfo: Array<EquipmentInfo>) {
    console.log("setEquipsInfo", equipsInfo)
    this.eqipsInfo = equipsInfo
  }

  @Action({ rawError: true })
  async fetchEquipsInfo() {
    await axios.get("equipment")
    .then(res => this.context.commit(
      "setEquipsInfo", 
      _.map(res.data.message, d => new EquipmentInfo(d))
    ))
  }
}