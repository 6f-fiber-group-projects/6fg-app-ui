<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8(v-if="equip")
      v-col(cols=12)
        v-row.align-center
          span.text-h3.mr-5 {{ equip.name }}
          v-chip(:color="statusColor") {{ status }}
      v-col(cols=12)
        v-btn.mr-3(@click="showEquipDetail=true" depressed color="success" dark) 編集
        v-btn(@click="changeStatus" depressed :color="useBtnColor" dark) {{ useBtnText }}
      v-col(cols=12)
        Calendar(:events="events" :equipId="equipId" @eventSelected="showCaledarDetail")

    v-dialog(v-model="showCalenderDetail" persistent max-width="600px")
      CalendarDetailCard(:event="selectedCalendarEvent" :isNew="isNewCalendarEvent"
          @close="showCalenderDetail=false" @created="createRsvn" @editted="updateRsvn" @deleted="deleteRsvn")

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(:name="equipName" @cancel="showEquipDetail=false" @emit="edited" @delete="deleted")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo, EquipmentRsvnInfo } from '../models'
import { EquipmentUpdate, CalendarEvent } from '../models/types'
import { userStore, authStore } from '../store'
import Calendar from "@/components/Calendar.vue"
import CalendarDetailCard from "@/components/CalendarDetailCard.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import api from "@/api"
import _ from "lodash"

const COLOR_CODE = ["success", "error", "warning"]

type RsvnInfo = {
  id?: number;
  userId?: number;
  start: Date;
  end: Date;
}

@Component({ components: {
  Calendar,
  CalendarDetailCard,
  EquipmentDetailCard
}})
export default class Equipment extends Vue {
  private equipId = 0
  private equip: EquipmentInfo | null = null
  private reservations: EquipmentRsvnInfo[] = []
  private showCalenderDetail = false
  private showEquipDetail = false
  private selectedCalendarEventInfo: any = {}

  async mounted() {
    this.equipId = parseInt(this.$route.params.equipId)
    await this.fetchUsers()
    await this.fetchEquips()
    await this.fetchRsvns()
  }

  get status() {
    if(!this.equip) return "error"
    return this.equip.status === 0 ? "使用可能" : "使用中"
  }

  get statusColor() {
    return this.equip ? COLOR_CODE[this.equip.status] : COLOR_CODE[1]
  }

  get useBtnText() {
    return this.equip?.status === 0 ? "使用開始" : "終了"
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

  get events(): CalendarEvent[] {
    return _.map(this.reservations, r => this.setEvent(r))
  }

  async fetchEquips() {
    await api.getEquipById(this.equipId)
    .then(d => this.equip = new EquipmentInfo(d.data.message))
  }

  async fetchRsvns() {
    await api.getRsvnByEquipId(this.equipId)
    .then(d => this.reservations = _.map(d.data.message, rsvn => new EquipmentRsvnInfo(rsvn)))
  }

  async fetchUsers() {
    await userStore.fetchUsers()
  }

  setEvent(r: EquipmentRsvnInfo): CalendarEvent {
    const user = userStore.getUserById(r.userId)
    const start = new Date(r.start)
    const end = new Date(r.end)
    return {
      rsvnId: r.id,
      name: user.name,
      user,
      start,
      end,
      color: "primary",
    }
  }

  showCaledarDetail(e: any) {
    this.selectedCalendarEventInfo = e
    this.showCalenderDetail = true
  }

  edited(equipName: string) {
    if(!this.equip) return
    this.updateEquip({
      id: this.equipId,
      name: equipName,
      status: this.equip.status
    })
  }

  changeStatus() {
    if(!this.equip) return
    this.updateEquip({
      id: this.equipId,
      name: this.equip.name,
      status: (this.equip.status + 1) % 2 
    })
  }

  async deleted() {
    await api.deleteEquip(this.equipId)
    this.showEquipDetail = false
    this.$router.push("/")
  }

  async updateEquip(params: EquipmentUpdate) {
    await api.updateEquip(params)
    this.showEquipDetail = false
    this.fetchEquips()
  }

  async createRsvn(rsvnInfo: RsvnInfo) {
    if (!authStore.getUserInfo) return
    await api.createRsvn({
      userId: authStore.getUserInfo.id,
      equipId: this.equipId,
      startDate: rsvnInfo.start,
      endDate: rsvnInfo.end
    })
    await this.fetchRsvns()
    this.showCalenderDetail = false
  }

  async updateRsvn(rsvnInfo: RsvnInfo) {
    if(!rsvnInfo.userId || !rsvnInfo.id) return
    await api.updateRsvn({
      id: rsvnInfo.id,
      userId: rsvnInfo.userId,
      equipId: this.equipId,
      startDate: rsvnInfo.start,
      endDate: rsvnInfo.end
    })
    await this.fetchRsvns()
    this.showCalenderDetail = false
  }

  async deleteRsvn(rsvnId: number) {
    await api.deleteRsvn({id: rsvnId})
    await this.fetchRsvns()
    this.showCalenderDetail = false
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>