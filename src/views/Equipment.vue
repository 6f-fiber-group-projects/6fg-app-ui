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
        Calendar(:reservations="reservations" :equipId="equipId" @updated="fetchreservations")
      v-col(cols=12)
        div {{ equip }}
        div {{ reservations }}

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(:name="equipName" @cancel="showEquipDetail=false" @emit="edited" @delete="deleted")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo, EquipmentRsvnInfo } from '../models'
import { EquipmentUpdate } from '../models/types'
import Calendar from "@/components/Calendar.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import api from "@/api"
import _ from "lodash"

const COLOR_CODE = ["success", "error", "warning"]

@Component({ components: { Calendar, EquipmentDetailCard } })
export default class Equipment extends Vue {
  private equipId = 0
  private equip: EquipmentInfo | null = null
  private reservations: EquipmentRsvnInfo[] = []
  private showEquipDetail = false

  async mounted() {
    this.equipId = parseInt(this.$route.params.equipId)
    await this.fetchequip()
    await this.fetchreservations()
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

  async fetchequip() {
    await api.getEquipById(this.equipId)
    .then(d => this.equip = new EquipmentInfo(d.data.message))
  }

  async fetchreservations() {
    await api.getRsvnByEquipId(this.equipId)
    .then(d => this.reservations = _.map(d.data.message, rsvn => new EquipmentRsvnInfo(rsvn)))
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
    this.fetchequip()
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>