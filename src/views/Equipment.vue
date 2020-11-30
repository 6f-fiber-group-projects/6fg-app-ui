<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8(v-if="equip")
      v-col(cols=12)
        v-row.align-center
          span.text-h3.mr-5 {{ equip.name }}
          v-chip(:color="statusColor") {{ statusText }}
      v-col(cols=12)
        v-btn.mr-3(@click="showEquipDetail=true" rounded color="success" dark) 編集
        v-btn.mr-3(@click="book" rounded color="primary" dark) 予約
        v-btn.mr-3(@click="changeStatus" rounded :color="useBtnColor" :loading="changingStatus" :disabled="!canChangeStatus") {{ useBtnText }}
        v-btn.mr-3(@click="generateEquipQR" rounded color="blue-grey" dark) QRコード表示
      v-col(cols=12)
        Calendar(:events="reservations" :equipId="equipId" @eventSelected="calendarEventHandler")

    v-dialog(v-model="showCalenderDetail" persistent max-width="600px")
      EquipmentReservationCard(:event="selectedCalendarEvent" :isNew="isNewCalendarEvent"
          :loading.sync="emiting" :dialog="showCalenderDetail" :equipId="equipId"
          @close="showCalenderDetail=false" @created="createRsvn" @edited="updateRsvn" @deleted="deleteRsvn")

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(:name="equipName" :loading.sync="emiting" @cancel="showEquipDetail=false" @emit="updateEquipInfo" @delete="deleteEquip")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo } from '../models'
import { EquipmentUpdate, RsvnInfo } from '../models/types'
import { authStore, appStore, equipStore, equipReservationStore } from '../store'
import { isLoginUser, isAdmin } from "@/plugins/utils"
import Calendar from "@/components/Calendar.vue"
import EquipmentReservationCard from "@/components/EquipmentReservationCard.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import Reservation from "@/plugins/reservation"
import api from "@/api"
import _ from "lodash"
import QRCode from "qrcode"

const COLOR_CODE = ["success", "warning", "error"] //使用可能・予約中・使用中

@Component({ components: {
  Calendar,
  EquipmentReservationCard,
  EquipmentDetailCard
}})
export default class Equipment extends Vue {
  private equipId = 0
  private showCalenderDetail = false
  private showEquipDetail = false
  private selectedCalendarEventInfo: any = {}
  private changingStatus = false
  private emiting = false
  private rsvn = new Reservation()

  async mounted() {
    appStore.onLoading()

    this.equipId = parseInt(this.$route.params.equipId)

    equipStore.subscribe()
    this.rsvn.Subscribe(this.equipId)
    await this.rsvn.Initialize(this.equipId)

    appStore.offLoading()
  }

  beforeDestroy() {
    equipStore.unsubscribe()
    this.rsvn.Unsubscribe(this.equipId)
  }

  get status() {
    return this.equip?.status === 0
      ? this.canStart ? 0 : 1 : 2
  }

  get statusText() {
    if (this.status === 0) return "使用可能"
    else if (this.status === 1) return "予約中"
    return "使用中"
  }

  get statusColor() {
    return COLOR_CODE[this.status]
  }

  get useBtnText() {
    if (this.status === 0) return "使用開始"
    else if (this.status === 1) return "予約済み"
    return "終了"
  }

  get useBtnColor() {
    return this.equip?.status === 0 ? "primary" : "error"
  }

  get equipName() {
    return this.equip?.name || ""
  }

  get selectedCalendarEvent() {
    return this.selectedCalendarEventInfo?.event || {}
  }

  get isNewCalendarEvent() {
    return !this.selectedCalendarEventInfo?.event || false
  }

  get canChangeStatus() {
    return this.equip?.status === 0 ? this.canStart : this.canStop
  }

  get canStart() {
    const rsvn = this.rsvn.CurrentReservation()
    if(!rsvn) return true
    if(rsvn.user.id === authStore.getUserInfo?.id) return true
    return false
  }

  get canStop() {
    if(!this.equip) return false
    return this.equip && (isLoginUser(this.equip.userId) || isAdmin())
  }

  get equip(): EquipmentInfo {
    return equipStore.currentEquipInfo(this.equipId) 
  }

  get reservations() {
    return this.rsvn.GetReservations()
  }

  book() {
    this.selectedCalendarEventInfo = null
    this.showCalenderDetail = true
  }

  calendarEventHandler(e: any) {
    this.selectedCalendarEventInfo = e
    this.showCalenderDetail = true
  }

  async updateEquipInfo(equipName: string) {
    if(!this.equip) return

    await api.updateEquip({
      id: this.equipId,
      name: equipName,
      status: this.equip.status
    })
    .finally(() => this.emiting = false)

    await equipStore.fetchEquipsInfo()
    this.showEquipDetail = false
  }

  async changeStatus() {
    if(!this.equip || !authStore.getUserInfo) return

    this.changingStatus = true
    await api.updateEquipStatus({
      equipId: this.equipId,
      equipStatus: (this.equip.status + 1) % 2,
      userId: authStore.getUserInfo.id,
      rsvnId: undefined
    })
    .finally(() => this.changingStatus = false)

    await equipStore.fetchEquipsInfo()
  }

  async deleteEquip() {
    await api.deleteEquip(this.equipId)
    .finally(() => this.emiting = false)
    this.showEquipDetail = false
    this.$router.push("/")
  }

  async createRsvn(rsvnInfo: RsvnInfo) {
    await this.rsvn.CreateRsvn([rsvnInfo])
    .finally(() => this.emiting = false)
    await equipReservationStore.fetchEquipRsvnsInfo(this.equipId)
    this.showCalenderDetail = false
  }

  async updateRsvn(rsvnInfo: RsvnInfo) {
    await this.rsvn.UpdateRsvn(rsvnInfo)
    .finally(() => this.emiting = false)
    await equipReservationStore.fetchEquipRsvnsInfo(this.equipId)
    this.showCalenderDetail = false
  }

  async deleteRsvn(rsvnInfo: RsvnInfo) {
    await this.rsvn.DeleteRsvn(rsvnInfo)
    .finally(() => this.emiting = false)
    await equipReservationStore.fetchEquipRsvnsInfo(this.equipId)
    this.showCalenderDetail = false
  }

  async generateEquipQR() {
    const img = new Image
    const domain = process.env.NODE_ENV === "production"
      ? "https://fibergroup.herokuapp.com"
      : "http://localhost:8080"
    QRCode.toDataURL(
      `${domain}/equipment/${this.equipId}`,
      { errorCorrectionLevel: 'H' },
      (_: string, url: string) => img.src = url
    )
    const w = window.open("")
    w?.document.write(img.outerHTML)
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>