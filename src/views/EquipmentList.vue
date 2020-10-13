<template lang="pug">
  .equipment
    v-row
      v-col(v-for="e in equipsInfo" :key="e.id" cols=12 sm=3)
        EquipmentCard(:equipInfo="e" @editted="equipStore.fetchEquipsInfo()")
    v-btn(fixed right bottom fab dark color="primary" @click="showEquipDetail=true")
      v-icon add

    v-dialog(v-model="showEquipDetail" max-width="600px")
      EquipmentDetailCard(type="new" @cancel="showEquipDetail=false" @emit="create")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { equipStore } from "@/store/index"
import EquipmentCard from "@/components/EquipmentCard.vue"
import EquipmentDetailCard from "@/components/EquipmentDetailCard.vue"
import _ from "lodash"
import api from '../api'

@Component({ components: { EquipmentCard, EquipmentDetailCard } })
export default class EquipmentList extends Vue {
  private showEquipDetail = false
  private fetchEquipId = 0

  mounted() {
    this.fetchEquipId = setInterval(this.fetchEquips, 5000)
  }

  beforeDestroy() {
    clearInterval(this.fetchEquipId)
  }

  get equipsInfo() {
    return _.sortBy(equipStore.getEquipsInfo, i => i.name)
  }

  async create(equipName: string) {
    await api.createEquip({name: equipName})
    await this.fetchEquips()
    this.showEquipDetail = false
  }

  async fetchEquips() {
    await equipStore.fetchEquipsInfo()
  }
}
</script>