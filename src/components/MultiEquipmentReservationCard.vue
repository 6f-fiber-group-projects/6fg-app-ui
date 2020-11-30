<template lang="pug">
  .multi-equip-rsvns
    v-card
      v-toolbar.mb-3(color="primary" dark dense elevation=0)
        v-toolbar-title まとめて予約
      v-card-text
        v-row
          v-col(v-if="existRsvn" cols=12)
            v-data-table(:headers="headers" :items="rsvns" item-key="name" hide-default-footer)
              template(v-slot:item.equipId="{ item }") {{ equipIdToName(item.equipId) }}
              template(v-slot:item.start="{ item }") {{ formatDate(item.start) }}
              template(v-slot:item.end="{ item }") {{ formatDate(item.end) }}
          v-col(cols=12)
            v-btn.white--text(@click="add" dark color="blue-grey") 追加する
              v-icon(small) add
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit" depressed color="primary" dark :disabled="!existRsvn") 予約

    v-dialog(v-model="showRsvnDetail" persistent max-width="600px")
      EquipmentReservationCard(:isNew="true" :loading.sync="emiting" :dialog="showRsvnDetail" :preRsvns="rsvns"
          @close="showRsvnDetail=false" @created="added" @edited="edited" @deleted="deleted")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import EquipmentReservationCard from "@/components/EquipmentReservationCard.vue"
import Reservation from "@/plugins/reservation"
import { RsvnInfo } from '../models/types'
import {
  userIdToName,
  equipIdToName,
  formatDate
} from "@/plugins/utils"

@Component({ components: { EquipmentReservationCard } })
export default class MultiEquipmentReservationCard extends Vue {
  private rsvn = new Reservation()
  private rsvns: RsvnInfo[] = []
  private showRsvnDetail = false
  private emiting = false
  private headers = [
    { text: "実験装置", value: "equipId", sortable: false, },
    { text: "開始時刻", value: "start", sortable: false, },
    { text: "終了時刻", value: "end", sortable: false, },
  ]

  get existRsvn() {
    return this.rsvns.length !== 0
  }

  add() {
    this.showRsvnDetail = true
  }

  added(r: any) {
    this.rsvns.unshift(r)
    this.showRsvnDetail = false
    this.emiting = false
  }

  edited() {
    console.log("edited")
  }

  deleted() {
    console.log("deleted")
  }

  emit() {
    this.$emit("emit", this.rsvns)
  }

  cancel() {
    this.$emit("cancel", this.rsvns)
  }

  userIdToName(userId: number) {
    return userIdToName(userId)
  }

  equipIdToName(equipId: number) {
    return equipIdToName(equipId)
  }

  formatDate(date: string) {
    return formatDate(date)
  }
}
</script>