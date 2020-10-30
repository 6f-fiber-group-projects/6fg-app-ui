<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8
      v-col(cols=12)
        v-chip-group(v-model="selectedTag" mandatory)
          v-chip(v-for="(tag, idx) in selectTags" :key="idx" :color="color(idx)") {{ tag }}
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
  equipReservationStore,
} from "@/store/index"
import { splitDatetime } from "@/plugins/utils"
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
  private selectTags = ["All", "Before now", "After Now"]
  private selectedTag = 0

  async mounted() {
    await userStore.fetchUsers()
    await equipStore.fetchEquipsInfo()
    await equipReservationStore.fetchAllEquipRsvnsInfo()

    equipReservationStore.subscribeAll()
  }

  destroyed() {
    equipReservationStore.unsubscribeAll()
  }

  get selectedRsvns() {
    if(this.selectedTag === 1) return this.rsvnsBeforeNow
    else if (this.selectedTag === 2) return this.rsvnsAfterNow
    return this.rsvns
  }

  get rsvns() {
    return equipReservationStore.getEquipRsvnsInfo
  }

  get rsvnsBeforeNow() {
    return this.rsvns.slice(this.rsvnsAfterNow.length)
  }

  get rsvnsAfterNow() {
    return _.filter(this.rsvns, r => r.start > new Date())
  }

  userIdToName(userId: number) {
    return userStore.getUserById(userId)?.name || null
  }

  equipIdToName(equipId: number) {
    return equipStore.getEquipInfoById(equipId)?.name || null
  }

  color(n: number) {
    return this.selectedTag === n ? "primary" : undefined
  }

  formatDate(date: string) {
    const d = splitDatetime(new Date(date))
    return `${d.year}年${d.month}月${d.day}日 ${d.hour}時${d.minute}分`
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>