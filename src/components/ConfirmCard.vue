<template lang="pug">
  v-card
    v-card-title
      slot(name="title")
    v-card-text
      slot(name="text")
    v-card-actions
      v-spacer
      v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
      v-btn(@click="emit" depressed color="error") {{ emitBtnText }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class ConfirmCaard extends Vue {
  @Prop({type: String, default: "OK"})
  emitBtnText!: string

  cancel() {
    this.$emit("cancel")
  }

  emit() {
    this.$emit("emit")
  }
}
</script>