<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8(v-if="equipInfo")
      v-col(cols=12)
        v-row.align-center
          span.text-h3.mr-5 {{ equipInfo.name }}
          v-chip(:color="color") {{ status }}
      v-col(cols=12)
        Calendar
      v-col(cols=12)
        div {{ equipInfo }}
        div {{ equipRsvnInfo }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { EquipmentInfo, EquipmentRsvnInfo } from '../models'
import Calendar  from "@/components/Calendar.vue"
import axios from "axios"
import _ from "lodash"

const COLOR_CODE = ["success", "error", "warning"]

@Component({ components: { Calendar } })
export default class Equipment extends Vue {
  private equipId = 0
  private equipInfo: EquipmentInfo | null = null
  private equipRsvnInfo: EquipmentRsvnInfo[] = []

  mounted() {
    this.equipId = parseInt(this.$route.params.equipId)
    this.fetchEquipInfo()
    this.fetchEquipRsvnInfo()
  }

  get status() {
    if(!this.equipInfo) return "error"
    return this.equipInfo.status === 0 ? "使用可能" : "使用中"
  }

  get color() {
    return this.equipInfo ? COLOR_CODE[this.equipInfo.status] : COLOR_CODE[1]
  }

  async fetchEquipInfo() {
    await axios.get(`equipment/${this.equipId}`)
    .then(d => this.equipInfo = new EquipmentInfo(d.data.message))
  }

  async fetchEquipRsvnInfo() {
    // TODO limit fetch data number
    await axios.get(`reservation/equipment?equipId=${this.equipId}`)
    .then(d => this.equipRsvnInfo = _.map(d.data.message, rsvn => new EquipmentRsvnInfo(rsvn)))
  }

}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>