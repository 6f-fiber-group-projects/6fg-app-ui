<template lang="pug">
  v-card
    v-toolbar.mb-3(:color="titleColor" dark dense elevation=0)
      v-toolbar-title {{ titleText }}
    v-card-text
      v-alert(v-if="!authorized" type="error") この操作ができる権限がありません
      v-text-field(v-model="equipName" label="実験装置名" :disabled="!authorized")
    v-card-actions
      v-spacer
      v-btn(@click="cancel" depressed color="grey darken-2" dark) cancel
      v-btn(@click="emit" depressed :color="emitBtnColor" :disabled="!authorized") {{ emitBtnText }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { authStore } from '../store'

@Component({})
export default class EquipmentDetailCard extends Vue {
  private equipName = ""

  @Prop({type: String, default: "edit"})
  type!: string

  @Prop({type: Boolean, default: true})
  adminOnly!: boolean

  get emitBtnText() {
    return this.type === "edit" ? "編集" : "登録"
  }

  get emitBtnColor() {
    return this.type === "edit" ? "success" : "primary"
  }

  get titleText() {
    return this.type === "edit" ? this.equipName :  "実験装置登録"
  }  

  get titleColor() {
    return !this.authorized ? "grey darken-2"
      : this.type === "edit" ? "success"
      : "primary"
  }

  get authorized() {
    return !this.adminOnly || authStore.getUserInfo?.auth == "admin"
  }

  cancel() {
    this.$emit("cancel")
  }

  emit() {
    this.$emit("emit", this.equipName)
  }
}
</script>