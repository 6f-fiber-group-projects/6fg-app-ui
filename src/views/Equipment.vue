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
        v-btn(@click="changeStatus" rounded :color="useBtnColor" :disabled="!canChangeStatus") {{ useBtnText }}
      v-col(cols=12)
        Calendar(:events="events" :equipId="equipId" @eventSelected="calendarEventHandler")

    v-dialog(v-model="showCalenderDetail" persistent max-width="600px")
      CalendarDetailCard(:event="selectedCalendarEvent" :rsvnEvents="events" :isNew="isNewCalendarEvent"
          @close="showCalenderDetail=false" @created="createRsvn" @edited="updateRsvn" @deleted="deleteRsvn")

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(:name="equipName" @cancel="showEquipDetail=false" @emit="updateEquipInfo" @delete="deleteEquip")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo, EquipmentRsvnInfo } from '../models'
import { EquipmentUpdate, CalendarEvent } from '../models/types'
import { userStore, authStore } from '../store'
import { isLoginUser, isAdmin } from "@/plugins/utils"
import Calendar from "@/components/Calendar.vue"
import CalendarDetailCard from "@/components/CalendarDetailCard.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import api from "@/api"
import _ from "lodash"

const COLOR_CODE = ["success", "warning", "error"] //使用可能・予約中・使用中

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
  private fetchUserId = 0
  private fetchEquipId = 0
  private fetchEquipRsvnId = 0

  mounted() {
    this.equipId = parseInt(this.$route.params.equipId)
    this.fetchUserId = setInterval(this.fetchUsers, 5000)
    this.fetchEquipId = setInterval(this.fetchEquips, 5000)
    this.fetchEquipRsvnId = setInterval(this.fetchRsvns, 5000)
  }

  beforeDestroy() {
    clearInterval(this.fetchUserId)
    clearInterval(this.fetchEquipId)
    clearInterval(this.fetchEquipRsvnId)
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

  get events(): CalendarEvent[] {
    return _.map(this.reservations, r => this.setEvent(r))
  }

  get canChangeStatus() {
    return this.equip?.status === 0 ? this.canStart : this.canStop
  }

  get canStart() {
    const rsvn = this.currentReservation()
    if(!rsvn) return true
    if(rsvn.userId === authStore.getUserInfo?.id) return true
    return false
  }

  get canStop() {
    if(!this.equip) return false
    return this.equip && (isLoginUser(this.equip.userId) || isAdmin())
  }

  currentReservation() {
    // Fix me
    return _.find(this.reservations, (r) => {
      const now = new Date()
      return r.start <= now && now <= r.end
    })
  }

  fetchEquips() {
    api.getEquipById(this.equipId)
    .then(d => this.equip = new EquipmentInfo(d.data.message))
  }

  fetchRsvns() {
    api.getRsvnByEquipId(this.equipId)
    .then(d => this.reservations = _.map(d.data.message, rsvn => new EquipmentRsvnInfo(rsvn)))
  }

  fetchUsers() {
    userStore.fetchUsers()
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
    this.showEquipDetail = false
    this.fetchEquips()
  }

  async changeStatus() {
    if(!this.equip || !authStore.getUserInfo) return
    await api.updateEquipStatus({
      equipId: this.equipId,
      equipStatus: (this.equip.status + 1) % 2,
      userId: authStore.getUserInfo.id,
      rsvnId: undefined
    })
    this.showEquipDetail = false
    this.fetchEquips()
  }

  async deleteEquip() {
    await api.deleteEquip(this.equipId)
    this.showEquipDetail = false
    this.$router.push("/")
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