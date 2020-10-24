import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { EquipmentInfo, EquipmentRsvnInfo } from "../models/index"
import store from "@/store/index"
import _ from "lodash"
import api from '@/api'

@Module({ store, name: 'EquipmentModule', namespaced: true })
export default class EquipModule extends VuexModule {
  private eqipsInfo: Array<EquipmentInfo> = []
  private currentEqipRsvnsInfo: Array<EquipmentRsvnInfo> = []
  private subscribeEquipId = 0
  private subscribeEquipRsvnId = 0

  get getEquipsInfo() {
    return this.eqipsInfo
  }

  get getEquipRsvnsInfo() {
    return this.currentEqipRsvnsInfo
  }

  get currentEquipInfo() {
    return (equipId: number) => _.filter(this.eqipsInfo, e => e.id === equipId)[0]
  }

  @Mutation
  setEquipsInfo(equipsInfo: Array<EquipmentInfo>) {
    console.log("setEquipsInfo", equipsInfo)
    this.eqipsInfo = equipsInfo
  }

  @Mutation
  setEquipRsvnsInfo(equipRsvnsInfo: Array<EquipmentRsvnInfo>) {
    console.log("setEquipRsvnsInfo", equipRsvnsInfo)
    this.currentEqipRsvnsInfo = equipRsvnsInfo
  }

  @Mutation
  subscribeEquips() {
    this.subscribeEquipId = setInterval(() => store.dispatch("EquipmentModule/fetchEquipsInfo"), 5000)
  }

  @Mutation
  unsubscribeEquips() {
    if(this.subscribeEquipId !== 0) clearInterval(this.subscribeEquipId)
    this.subscribeEquipId = 0
  }

  @Mutation
  subscribeEquipRsvns(equipId: number) {
    this.subscribeEquipRsvnId = setInterval(() => store.dispatch("EquipmentModule/fetchEquipRsvnsInfo", equipId), 5000)
  }

  @Mutation
  unsubscribeEquipRsvns() {
    if(this.subscribeEquipRsvnId !== 0) clearInterval(this.subscribeEquipRsvnId)
    this.subscribeEquipRsvnId = 0
    this.currentEqipRsvnsInfo = []
  }

  @Action({ rawError: true })
  async fetchEquipsInfo() {
    await api.getEquips()
    .then(res => this.context.commit(
      "setEquipsInfo", 
      _.map(res.data.message, d => new EquipmentInfo(d))
    ))
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
  subscribe() {
    this.unsubscribeEquips()
    this.subscribeEquips()
  }

  @Action({ rawError: true })
  unsubscribe() {
    this.unsubscribeEquips()
  }

  @Action({ rawError: true })
  subscribeRsvns(equipId: number) {
    this.unsubscribeEquipRsvns()
    this.subscribeEquipRsvns(equipId)
  }

  @Action({ rawError: true })
  unsubscribeRsvns() {
    this.unsubscribeEquipRsvns()
  }
}