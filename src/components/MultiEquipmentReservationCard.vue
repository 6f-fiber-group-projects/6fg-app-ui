<template lang="pug">
  .multi-equip-rsvns
    v-card
      v-toolbar.mb-3(color="primary" dark dense elevation=0)
        v-toolbar-title まとめて予約
      v-card-text
        v-row(v-for="(r, idx) in rsvns")
          v-col(cols=1)
            v-btn(v-if="rsvns.length === idx+1" icon @click="add")
              v-icon(small) add
          v-col(cols=11)
            div {{r}}
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit" depressed color="primary" dark) 予約

    v-dialog(v-model="showRsvnDetail" persistent max-width="600px")
      EquipmentReservationCard(:isNew="true" :loading.sync="emiting" :dialog="showRsvnDetail" :equipId="equipId"
          @close="showRsvnDetail=false" @created="added" @edited="edited" @deleted="deleted")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import EquipmentReservationCard from "@/components/EquipmentReservationCard.vue"
import Reservation from "@/plugins/reservation"

@Component({ components: { EquipmentReservationCard } })
export default class MultiEquipmentReservationCard extends Vue {
  private rsvns: any[] = []
  private showRsvnDetail = false
  private emiting = false
  private rsvn = new Reservation()

  @Prop({type: Number, default: null})
  equipId!: number

  created() {
    this.initRsvns()
  }

  initRsvns() {
    this.rsvns = ["dummy"]
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
    console.log("emit")
    // this.rsvn.CreateRsvn()
  }

  cancel() {
    this.initRsvns()
  }
}
</script>