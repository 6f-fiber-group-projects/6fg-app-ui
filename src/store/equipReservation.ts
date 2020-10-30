import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { EquipmentRsvnInfo } from "../models/index"
import store from "@/store/index"
import _ from "lodash"
import api from '@/api'

@Module({ store, name: 'EquipmentReservationModule', namespaced: true })
export default class EquipmentReservationModule extends VuexModule {
  private list: Array<EquipmentRsvnInfo> = []
  private currentEqipRsvnsInfo: Array<EquipmentRsvnInfo> = []
  private subscribeId = 0
  private subscribeAllId = 0

  get getEquipRsvnsInfo() {
    return this.list
  }

  get getCurrentEquipRsvnsInfo() {
    return this.currentEqipRsvnsInfo
  }

  @Mutation
  setAllEquipRsvnsInfo(equipRsvnsInfo: Array<EquipmentRsvnInfo>) {
    this.list = _.orderBy(equipRsvnsInfo, "start", "desc")
    console.log("setAllEquipRsvnsInfo")
  }

  @Mutation
  setEquipRsvnsInfo(equipRsvnsInfo: Array<EquipmentRsvnInfo>) {
    console.log("setEquipRsvnsInfo", equipRsvnsInfo)
    this.currentEqipRsvnsInfo = equipRsvnsInfo
  }

  @Mutation
  subscribeEquipRsvns(equipId: number) {
    this.subscribeId = setInterval(() => store.dispatch("EquipmentReservationModule/fetchEquipRsvnsInfo", equipId), 5000)
  }

  @Mutation
  unsubscribeEquipRsvns() {
    if(this.subscribeId !== 0) clearInterval(this.subscribeId)
    this.subscribeId = 0
    this.currentEqipRsvnsInfo = []
  }

  @Mutation
  subscribeAllEquipRsvns() {
    this.subscribeAllId = setInterval(() => store.dispatch("EquipmentReservationModule/fetchAllEquipRsvnsInfo"), 60 * 1000)
  }

  @Mutation
  unsubscribeAllEquipRsvns() {
    if(this.subscribeAllId !== 0) clearInterval(this.subscribeAllId)
    this.subscribeAllId = 0
  }

  @Action({ rawError: true })
  async fetchEquipRsvnsInfo(equipId: number) {
    await api.getRsvnByEquipId(equipId)
    .then(res => this.context.commit(
      "setEquipRsvnsInfo", 
      _.map(res.data.message, d => new EquipmentRsvnInfo(d))
    ))
  }

  @Action({ rawError: true })
  async fetchAllEquipRsvnsInfo() {
    await api.getRsvn()
    .then(res => this.context.commit(
        "setAllEquipRsvnsInfo", 
        _.map(res.data.message, d => new EquipmentRsvnInfo(d))
    ))
  }

  @Action({ rawError: true })
  subscribe(equipId: number) {
    this.unsubscribeEquipRsvns()
    this.subscribeEquipRsvns(equipId)
  }

  @Action({ rawError: true })
  unsubscribe() {
    this.unsubscribeEquipRsvns()
  }

  @Action({ rawError: true })
  subscribeAll() {
    this.unsubscribeAllEquipRsvns()
    this.subscribeAllEquipRsvns()
  }

  @Action({ rawError: true })
  unsubscribeAll() {
    this.unsubscribeAllEquipRsvns()
  }
}