<template lang="pug">
  .equipment
    v-row.mx-5
      v-col(v-if="isAdmin" cols=12)
        v-btn.my-5(rounded color="primary" dark @click="showEquipDetail=true") 新規登録
      v-col(cols=12)
        v-text-field(v-model="searchWords" @click:clear="searchWords=''" placeholder="実験装置を検索" clearable prepend-inner-icon="search")
      v-col(v-for="e in filteredEquips" :key="e.id" cols=12 sm=2)
        EquipmentCard(:equipInfo="e" @editted="equipStore.fetchEquipsInfo()")
    v-btn(fixed right bottom fab dark color="primary" @click="showMultiEquipmentReservation=true")
      v-icon add

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(type="new" @cancel="showEquipDetail=false" @emit="create")

    v-dialog(v-model="showMultiEquipmentReservation" max-width="600px")
      MultiEquipmentReservationCard(@cancel="showMultiEquipmentReservation=false" @emit="createRsvns")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { equipStore, appStore } from "@/store/index"
import EquipmentCard from "@/components/EquipmentCard.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import MultiEquipmentReservationCard from "@/components/MultiEquipmentReservationCard.vue"
import { isAdmin } from "@/plugins/utils"
import _ from "lodash"
import api from '../api'
import { RsvnInfo } from '../models/types'
import Reservation from '../plugins/reservation'

@Component({ components: { 
  EquipmentCard,
  EquipmentDetailCard,
  MultiEquipmentReservationCard 
} })
export default class EquipmentList extends Vue {
  private showEquipDetail = false
  private showMultiEquipmentReservation = false
  private Rsvn = new Reservation()
  private searchWords = ""

  async mounted() {
    equipStore.subscribe()
    await this.initialLoad()
  }

  beforeDestroy() {
    equipStore.unsubscribe()
  }

  get equips() {
    return _.sortBy(equipStore.getEquipsInfo, i => i.name)
  }

  get isAdmin() {
    return isAdmin()
  }

  get filteredEquips() {
    return this.searchWords 
      ? _.filter(this.equips, e => _.includes(e.name, this.searchWords))
      : this.equips
  }

  async initialLoad() {
    appStore.onLoading()
    await this.fetchEquips()
    appStore.offLoading()
  }

  async create(equipName: string) {
    await api.createEquip({name: equipName})
    await this.fetchEquips()
    this.showEquipDetail = false
  }

  async fetchEquips() {
    await equipStore.fetchEquipsInfo()
  }

  async createRsvns(rsvnInfos: RsvnInfo[]) {
    await this.Rsvn.CreateRsvn(rsvnInfos)
    .finally(() => this.showMultiEquipmentReservation = false)
  }
}
</script>

<style lang="stylus" scoped>
.v-text-field
  max-width 300px
</style>