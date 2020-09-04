<template lang="pug">
  v-row(justify="center")
    v-col(v-for="e in equipsInfo" :key="e.id" cols=12 sm=3)
      EquipmentCard(:equipInfo="e")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { equipStore } from "@/store/index"
import EquipmentCard from "@/components/EquipmentCard.vue"

@Component({ components: { EquipmentCard } })
export default class EquipmentList extends Vue {
  async mounted() {
    if(equipStore.getEquipsInfo.length === 0) await equipStore.fetchEquipsInfo()
  }

  get equipsInfo() {
    return equipStore.getEquipsInfo
  }
}
</script>