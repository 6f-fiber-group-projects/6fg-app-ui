<template lang="pug">
  v-card(:to="toEquipPage()")
    v-img(:src="imgSrc")
    v-card-title
      span {{ equipInfo.name }}
      v-icon.ml-1(small :color="color" :title="iconDiscription") mdi-circle
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { EquipmentInfo } from '../models'

@Component({})
export default class EquipmentCard extends Vue {
  @Prop({ type: EquipmentInfo })
  private equipInfo!: EquipmentInfo

  get imgSrc() {
    return this.equipInfo.imgsrc || "https://cdn.vuetifyjs.com/images/parallax/material.jpg"
  }

  get color() {
    // staus "0":  not used
    // staus "1":  used
    return this.equipInfo.status == 1 ? "error" : "success"
  }
  
  get iconDiscription() {
    return this.equipInfo.status == 1 ? "使用中" : "未使用"
  }

  toEquipPage() {
    return { name: "Equipment", params: { equipId: this.equipInfo.id }}
  }
}
</script>

<style lang="stylus" scoped>
.v-card__title
  a
    text-decoration none
</style>