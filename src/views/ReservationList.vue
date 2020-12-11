<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8
      v-col(cols=12)
        v-tabs(v-model="selectedTag")
          v-tab(v-for="(tag, idx) in selectTags" :key="idx" :color="color(idx)") {{ tag }}
      v-col(cols=12)
        v-data-table(:headers="headers" :items="selectedRsvns" item-key="id")
          template(v-slot:item.equipId="{ item }") {{ equipIdToName(item.equipId) }}
          template(v-slot:item.userId="{ item }") {{ userIdToName(item.userId) }}
          template(v-slot:item.start="{ item }") {{ formatDate(item.start) }}
          template(v-slot:item.end="{ item }") {{ formatDate(item.end) }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { 
  userStore,
  equipStore,
  appStore,
} from "@/store/index"
import {
  userIdToName,
  equipIdToName,
  formatDate
} from "@/plugins/utils"
import Reservation from "@/plugins/reservation"
import api from "@/api"
import _ from "lodash"

@Component({})
export default class ReservationList extends Vue {
  private headers = [
    { text: "ID", value: "id", sortable: false, },
    { text: "実験装置", value: "equipId", sortable: false, },
    { text: "ユーザー名", value: "userId", sortable: false, },
    { text: "開始時刻", value: "start", sortable: false, },
    { text: "終了時刻", value: "end", sortable: false, },
  ]
  private selectTags = ["予約状況", "予約履歴"]
  private selectedTag = 0
  private Rsvn = new Reservation()

  async mounted() {
    appStore.onLoading()

    this.Rsvn.Subscribe()
    await this.Rsvn.Initialize()

    await userStore.fetchUsers()
    await equipStore.fetchEquipsInfo()

    appStore.offLoading()
  }

  destroyed() {
    this.Rsvn.Unsubscribe()
  }

  get selectedRsvns() {
    if(this.selectedTag === 0) return this.rsvnsAfterNow
    return this.rsvnsBeforeNow
  }

  get rsvns() {
    return this.Rsvn.GetReservations()
  }

  get rsvnsBeforeNow() {
    return this.rsvns.slice(this.rsvnsAfterNow.length)
  }

  get rsvnsAfterNow() {
    return _.filter(this.rsvns, r => r.end > new Date())
  }

  userIdToName(userId: number) {
    return userIdToName(userId)
  }

  equipIdToName(equipId: number) {
    return equipIdToName(equipId)
  }

  color(n: number) {
    return this.selectedTag === n ? "primary" : undefined
  }

  formatDate(date: string) {
    return formatDate(date)
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>