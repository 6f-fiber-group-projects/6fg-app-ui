<template lang="pug">
  .equipment-detail
    v-card
      v-toolbar.mb-3(:color="titleColor" dark dense elevation=0)
        v-toolbar-title {{ titleText }}
        v-spacer
        v-btn(v-if="authorized" @click="deleteClicked" text fab small)
          v-icon delete
      v-card-text
        v-alert(v-if="!authorized" type="error") この操作ができる権限がありません
        v-text-field(v-model="equipName" label="実験装置名" :disabled="!authorized")
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) cancel
        v-btn(@click="emit" depressed :color="emitBtnColor" :disabled="!authorized") {{ emitBtnText }}

    v-dialog(v-model="showConfirm"  max-width="300px")
      ConfirmCard(emitBtnText="削除" @cancel="showConfirm=false" @emit="deleteHandler")
        template(#title) {{ confirm.title }}
        template(#text) {{ confirm.text }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { authStore } from '../store'
import ConfirmCard from "@/components/ConfirmCard.vue"

@Component({ components: { ConfirmCard }})
export default class EquipmentDetailCard extends Vue {
  private equipName = ""
  private showConfirm = false
  private confirm = {title: "", text: ""}


  @Prop({type: String, default: ""})
  name!: string

  @Prop({type: String, default: "edit"})
  type!: string

  @Prop({type: Boolean, default: true})
  adminOnly!: boolean

  mounted() {
    this.equipName = this.name
  }

  get emitBtnText() {
    return this.type === "edit" ? "編集" : "登録"
  }

  get emitBtnColor() {
    return this.type === "edit" ? "success" : "primary"
  }

  get titleText() {
    return this.type === "edit" ? this.name :  "実験装置登録"
  }  

  get titleColor() {
    return !this.authorized 
      ? "grey darken-2"
      : this.type === "edit"
      ? "success"
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

  deleteClicked() {
    this.setConfirmation()
    this.showConfirm = true
  }

  setConfirmation() {
    this.confirm = {
      title: `本当に${this.equipName}を削除してもよいですか？`,
      text: "この操作は取り消せません"
    }
  }

  deleteHandler() {
    this.$emit("delete")
  }
}
</script>