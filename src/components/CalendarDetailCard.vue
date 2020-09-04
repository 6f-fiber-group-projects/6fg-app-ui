<template lang="pug">
  v-card
    v-toolbar.mb-3(:color="color" dark dense elevation=0)
      v-toolbar-title {{ event.name }}
      v-spacer
      v-btn(v-if="showEditBtn" text fab small @click="editClicked")
        v-icon(small) edit
    v-card-text
      v-row
        v-col(cols=6)
          v-menu(v-model="dateMenu" ref="date" :close-on-content-click="false" 
              transition="scale-transition" offset-y :disabled="!editting")
            template(v-slot:activator="{ on, attrs }")
              v-text-field(v-model="formattedDate" label="日付" prepend-icon="event" v-on="on" v-bind="attrs" readonly :disabled="!editting")
            v-date-picker(v-model="date" no-title scrollable)
        v-col(cols=3)
          v-select(v-model="hour" :items="hours" :disabled="!editting" label="時刻（時）")
        v-col(cols=3)
          v-select(v-model="minute" :items="minutes" :disabled="!editting" label="時刻（分）")
    v-card-actions
      v-spacer
      v-btn(@click="cancel" depressed color="grey darken-2" dark) cancel
      v-btn(@click="emit" depressed :color="color" :disabled="!editting" :dark="editting") {{ emitBtnText }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CalendarEvent } from '../models/types'
import { isLoginUser, isAdmin } from "@/plugins/utils"

@Component({})
export default class Calendar extends Vue {
  private edit = false
  private editted = {start: Date, end: Date}
  private start = ""
  private end = ""
  private date = ""
  private originalStartDatetime!: Date
  private dateMenu = false
  private hour = 0
  private minute = 0

  @Prop({type: Object, default: () => ({})})
  event!: CalendarEvent

  @Prop({type: Boolean, default: false})
  isNew!: boolean

  mounted() {
    this.originalStartDatetime = this.event ? this.event.start : new Date()
    this.date = this.formatDate(this.originalStartDatetime)
  }

  get color() {
    if(this.isNew) return "primary"
    else if(this.isEditable()) return "success"
    return "grey darken-2"
  }

  get editting() {
    return this.isNew || this.edit
  }

  get showEditBtn() {
    return !this.isNew && this.isEditable()
  }

  get formattedDate() {
    return this.date
  }

  get hours() {
    return Array.from(Array(24), (v, k) => k)
  }

  get minutes() {
    return Array.from(Array(60), (v, k) => k)
  }

  get emitBtnText() {
    return this.isNew ? "book" : "edit"
  }

  cancel() {
    this.date = this.formatDate(this.originalStartDatetime)
    this.$emit("close")
  }

  emit() {
    console.log("emit")
  }

  editClicked() {
    this.edit = !this.edit
  }

  isEditable() {
    return isLoginUser(this.event?.user.id) || isAdmin()
  }

  formatDate(date: Date) {
    return date.toISOString().substr(0, 10)
  }
}
</script>