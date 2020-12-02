<template lang="pug">
  .multi-equip-rsvns
    v-card
      v-toolbar.mb-3(color="primary" dark dense elevation=0)
        v-toolbar-title まとめて予約
      v-card-text
        v-row
          v-col(v-if="existRsvn" cols=12)
            v-data-table(:headers="headers" :items="preRsvns" item-key="name" hide-default-footer)
              template(v-slot:item.equipId="{ item }") {{ equipIdToName(item.equipId) }}
              template(v-slot:item.start="{ item }") {{ formatDate(item.start) }}
              template(v-slot:item.end="{ item }") {{ formatDate(item.end) }}
              template(v-slot:item.actions="{ item }")
                v-icon.mr-2(@click="edit(item)") mdi-pencil
                v-icon(@click="remove(item.preRsvnId)") mdi-delete
          v-col(cols=12)
            v-btn.white--text(@click="add" dark color="blue-grey") 追加する
              v-icon(small) add
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit" depressed color="primary" :dark="existRsvn" :disabled="!existRsvn") 予約

    v-dialog(v-model="showRsvnDetail" persistent max-width="600px")
      EquipmentReservationCard(:event="selectedEvent" :loading.sync="emiting" :dialog="showRsvnDetail" :preRsvns="rsvns"
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
import _ from "lodash"
import { v4 as uuidv4 } from "uuid"

type PreRsvnInfo = RsvnInfo & { preRsvnId: string }

@Component({ components: { EquipmentReservationCard } })
export default class MultiEquipmentReservationCard extends Vue {
  private rsvn = new Reservation()
  private preRsvns: PreRsvnInfo[] = []
  private showRsvnDetail = false
  private emiting = false
  private headers = [
    { text: "実験装置", value: "equipId", sortable: false, },
    { text: "開始時刻", value: "start", sortable: false, },
    { text: "終了時刻", value: "end", sortable: false, },
    { text: "編集", value: "actions", sortable: false, },
  ]
  private selectedEvent = {}
  private editingPreRsvnId = ""

  get existRsvn() {
    return this.rsvns.length !== 0
  }

  get rsvns() {
    return _.map(this.preRsvns, r =>{
      const preRsvn = _.cloneDeep(r)
      delete preRsvn.preRsvnId
      return preRsvn
    })
  }

  add() {
    this.showRsvnDetail = true
  }

  edit(e: PreRsvnInfo) {
    this.selectedEvent = e
    this.editingPreRsvnId = e.preRsvnId
    this.showRsvnDetail = true
  }

  remove(preRsvnId: string) {
    this.preRsvns = _.filter(this.preRsvns, r => r.preRsvnId !== preRsvnId)
  }

  added(r: any) {
    r.preRsvnId = uuidv4()
    this.preRsvns.unshift(r)
    this.close()
  }

  edited(item: any) {
    this.remove(this.editingPreRsvnId)
    this.added(item)
    this.close()
    this.initEditInfo()
  }

  deleted() {
    this.remove(this.editingPreRsvnId)
    this.close()
    this.initEditInfo()
  }

  emit() {
    this.$emit("emit", this.rsvns)
    this.preRsvns = []
    this.close()
  }

  cancel() {
    this.$emit("cancel", this.rsvns)
    this.preRsvns = []
    this.close()
  }

  close() {
    this.showRsvnDetail = false
    this.emiting = false
  }

  initEditInfo() {
    this.selectedEvent = {}
    this.editingPreRsvnId = ""
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