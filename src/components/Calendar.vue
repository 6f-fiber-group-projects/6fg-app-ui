<template lang="pug">
  .calendar
    v-sheet
      v-btn(color="primary" @click="book") Book
    v-sheet
      v-toolbar(flat)
        v-btn.mr-4(outlined :color="baseBtnColor" @click="setToday") Today
        v-btn(fab text small :color="baseBtnColor" @click="prev")
          v-icon(small) mdi-chevron-left
        v-btn(fab text small :color="baseBtnColor" @click="next")
          v-icon(small) mdi-chevron-right
        v-toolbar-title(v-if="calendar") {{ calendar.title }}
        v-spacer
        v-menu(bottom right)
          template(v-slot:activator="{ on, attrs }")
            v-btn(outlined v-on="on" v-bind="attrs" :color="baseBtnColor")
              span {{ type }}
              v-icon(right) mdi-menu-down
          v-list
            template(v-for="(type, idx) in availableTypes" key=idx)
              v-list-item(@click="setType(type)")
                v-list-item-title {{ cap(type) }}
    v-sheet
      v-calendar(v-model="focus" :type="type" :events="events" 
          @click:event="showEvent" color="primary" ref="calendar")

    v-dialog(v-model="showDialog" persistent max-width="600px")
      CalendarDetailCard(:event="selectedEvent" :isNew="isNewEvent" @close="showDialog=false"
          @created="createRsvn" @editted="updateRsvn" @deleted="deleteRsvn")
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { EquipmentRsvnInfo, UserInfo } from '../models'
import { CalendarEvent } from '../models/types'
import { userStore, authStore } from "@/store"
import { capitalize } from "@/plugins/utils"
import api from "@/api"
import CalendarDetailCard from "@/components/CalendarDetailCard.vue"
import _ from "lodash"

type RsvnInfo = {
  id?: number;
  userId?: number;
  start: Date;
  end: Date;
}

@Component({ components: { CalendarDetailCard } })
export default class Calendar extends Vue {
  private baseBtnColor = "grey darken-2"
  private calendar: any = ""
  private focus = ""
  private type = "month"
  private users: any
  private events: Array<CalendarEvent> = []
  private showDialog = false
  private selectedEventInfo: any = {}
  private readonly availableTypes = ["month", "week", "day"]

  @Prop({type: Array, default: []})
  private reservations!: EquipmentRsvnInfo[]

  @Prop({type: Number})
  private equipId!: number

  async mounted() {
    this.users = userStore.getUsers.length === 0 
      ? await userStore.fetchUsers()
      : userStore.getUsers
    this.calendar = this.$refs.calendar 
    this.initReservation()
  }

  @Watch("reservations")
  onChangeRsvn(){
    this.events = _.map(this.reservations, r => this.setEvent(r))
  }

  get selectedEvent() {
    return this.selectedEventInfo ? this.selectedEventInfo.event : {}
  }

  get isNewEvent() {
    return !this.selectedEventInfo?.event || false
  }

  initReservation() {
    this.onChangeRsvn()
  }

  setEvent(r: EquipmentRsvnInfo): CalendarEvent {
    const user = this.users.filter((u: UserInfo) => u.id === r.userId)[0]
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

  setToday () {
    this.focus = ""
  }

  prev () {
    this.calendar.prev()
  }

  next () {
    this.calendar.next()
  }

  setType(type: string) {
    this.type = type
  }

  showEvent(e: any) {
    this.selectedEventInfo = e
    this.showDialog = true
  }

  book() {
    this.selectedEventInfo = null
    this.showDialog = true
  }

  async createRsvn(rsvnInfo: RsvnInfo) {
    if (!authStore.getUserInfo) return
    await api.createRsvn({
      userId: authStore.getUserInfo.id,
      equipId: this.equipId,
      startDate: rsvnInfo.start,
      endDate: rsvnInfo.end
    })
    .then(() => this.$emit("updated"))
    this.showDialog = false
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
    .then(() => this.$emit("updated"))
    this.showDialog = false
  }

  async deleteRsvn(rsvnId: number) {
    await api.deleteRsvn({id: rsvnId})
    .then(() => this.$emit("updated"))
    this.showDialog = false
  }

  cap(str: string) {
    return capitalize(str)
  }

}
</script>