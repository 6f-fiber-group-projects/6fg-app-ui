<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8(v-if="equip")
      v-col(cols=12)
        v-row.align-center
          span.text-h3.mr-5 {{ equip.name }}
          v-chip(:color="color") {{ status }}
      v-col(cols=12)
        Calendar(:reservations="reservations" :equipId="equipId" @updated="fetchreservations")
      v-col(cols=12)
        div {{ equip }}
        div {{ reservations }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo, EquipmentRsvnInfo } from '../models'
import Calendar  from "@/components/Calendar.vue"
import api from "@/api"
import _ from "lodash"

const COLOR_CODE = ["success", "error", "warning"]

@Component({ components: { Calendar } })
export default class Equipment extends Vue {
  private equipId = 0
  private equip: EquipmentInfo | null = null
  private reservations: EquipmentRsvnInfo[] = []

  mounted() {
    this.equipId = parseInt(this.$route.params.equipId)
    this.fetchequip()
    this.fetchreservations()
  }

  get status() {
    if(!this.equip) return "error"
    return this.equip.status === 0 ? "使用可能" : "使用中"
  }

  get color() {
    return this.equip ? COLOR_CODE[this.equip.status] : COLOR_CODE[1]
  }

  async fetchequip() {
    await api.getEquipById(this.equipId)
    .then(d => this.equip = new EquipmentInfo(d.data.message))
  }

  async fetchreservations() {
    await api.getRsvnByEquipId(this.equipId)
    .then(d => this.reservations = _.map(d.data.message, rsvn => new EquipmentRsvnInfo(rsvn)))
  }

}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>