import _ from "lodash"
import { 
  userStore,
  equipReservationStore
} from "@/store"
import { EquipmentRsvnInfo } from "@/models/index"

export default class Reservation {
  async Initialize(equipId: number) {
    await userStore.fetchUsers()
    await equipReservationStore.fetchEquipRsvnsInfo(equipId)
  }

  GetReservations() {
    return _.map(
      equipReservationStore.getCurrentEquipRsvnsInfo,
      r => this.applyRsvnFormat(r)
    )
  }

  Subscribe(equipId?: number) {
    if(equipId) equipReservationStore.subscribe(equipId)
    equipReservationStore.subscribeAll
  }

  Unsubscribe(equipId?: number) {
    if(equipId) equipReservationStore.unsubscribe()
    equipReservationStore.unsubscribeAll
  }

  CurrentReservation() {
    const rsvns = this.GetReservations()
    return _.find(rsvns, (r) => {
      const now = new Date()
      return r.start <= now && now <= r.end
    })
  }

  BookRules(start: Date, end: Date, type: string, rsvnId?: number) {
    const rules: (() => boolean | string)[] = []
    if(type === "start" && this.CanManageBook(end)) rules.push(
      () => this.validateStartDate(start) || "開始時刻が現在時刻より前です",
      () => this.canBook(start, end, type, rsvnId) || "予約時刻が被っています"
    )
    if(type === "end" && this.CanManageBook(end)) rules.push(
      () => this.validateEndDate(start, end) || "終了時刻が開始時刻より前です",
      () => this.canBook(start, end, type, rsvnId) || "予約時刻が被っています"
    )
    return rules
  }

  CanManageBook(end: Date) {
    return end.getTime() > new Date().getTime()
  }

  private applyRsvnFormat(r: EquipmentRsvnInfo) {
    const user = userStore.getUserById(r.userId)
    const start = new Date(r.start)
    const end = new Date(r.end)
    return {
      rsvnId: r.id,
      name: user.name,
      user,
      start,
      end
    }
  }

  private canBook(start: Date, end: Date, type: string, rsvnId?: number) {
    const inputSt = start.getTime()
    const inputEd = end.getTime()
    for(const r of this.GetReservations()) {
      if(rsvnId === r.rsvnId) continue
      const st = r.start.getTime()
      const ed = r.end.getTime()
      if(type === "start" && (st < inputSt && inputSt < ed)) return false 
      else if((st < inputEd && inputEd < ed) || (inputSt < st && ed < inputEd)) return false
    }
    return true
  }

  private isAfter(d1: Date, d2: Date) {
    return d1.getTime() > d2.getTime()
  }

  private validateStartDate(start: Date) {
    const now = new Date()
    return this.isAfter(start, new Date(now.getTime() - 60*1000))
  }

  private validateEndDate(start: Date, end: Date) {
    return this.isAfter(end, start)
  }
}