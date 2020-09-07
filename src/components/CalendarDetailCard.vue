<template lang="pug">
  .detail
    v-card
      v-toolbar.mb-3(:color="color" dark dense elevation=0)
        v-toolbar-title {{ cardTile }}
        v-spacer
        v-btn(v-if="showManageBtn" text fab small @click="editClicked")
          v-icon(small) edit
        v-btn(v-if="showManageBtn" text fab small @click="deleteClicked")
          v-icon(small) delete
      v-card-text
        v-row(v-for="(item, key, idx) in dateInfos" :key="idx")
          v-col.py-0(cols=12) {{ item.label }}
          v-col(cols=6)
            v-menu(v-model="item.spacer" ref="date" :close-on-content-click="false" 
                transition="scale-transition" offset-y :disabled="!editting")
              template(v-slot:activator="{ on, attrs }")
                v-text-field(v-model="item.date" label="日付" prepend-icon="event" v-on="on" v-bind="attrs" readonly :disabled="!editting")
              v-date-picker(v-model="item.date" no-title scrollable)
          v-col(cols=3)
            v-select(v-model="item.hour" :items="hours" :disabled="!editting" label="時刻（時）")
          v-col(cols=3)
            v-select(v-model="item.minute" :items="minutes" :disabled="!editting" label="時刻（分）")
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) cancel
        v-btn(@click="emit" depressed :color="color" :disabled="!editting" :dark="editting") {{ emitBtnText }}

    v-dialog(v-model="showConfirm"  max-width="300px")
      ConfirmCard(emitBtnText="delete" @cancel="showConfirm=false" @emit="deleteHandler")
        template(#title) {{ confirm.title }}
        template(#text) {{ confirm.text }}

</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { CalendarEvent } from '../models/types'
import { isLoginUser, isAdmin } from "@/plugins/utils"
import { authStore } from '../store'
import ConfirmCard from "@/components/ConfirmCard.vue"
import _ from "lodash"

type DateInfo = {
  date: string;
  hour: number;
  minute: number;
  showMenu: boolean;
  label: string;
}

@Component({ components: { ConfirmCard } })
export default class Calendar extends Vue {
  private edit = false
  private dateInfos: {[s: string]: DateInfo | null} = {start: null, end: null} // https://vuejs.org/2016/02/06/common-gotchas/#Why-isn%E2%80%99t-the-DOM-updating
  private originalDateInfos: {[s: string]: Date} = {}
  private isDelete = false
  private showConfirm = false
  private confirm = {title: "", text: ""}

  @Prop({type: Object, default: () => ({})})
  event!: CalendarEvent

  @Prop({type: Boolean, default: false})
  isNew!: boolean

  beforeMount() {
    this.initDateInfo()
  }

  @Watch("event")
  onEventChange(){
    this.initDateInfo()
  }

  get color() {
    if(this.isNew) return "primary"
    else if(this.isEditable()) return "success"
    return "grey darken-2"
  }

  get editting() {
    return this.isNew || this.edit
  }

  get showManageBtn() {
    return !this.isNew && this.isEditable()
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

  get cardTile() {
    return this.isNew ? authStore.getUserInfo?.name : this.event.name
  }

  initDateInfo() {
    this.originalDateInfos = {
      start: Object.keys(this.event).length !== 0 ? this.event.start: new Date(),
      end: Object.keys(this.event).length !== 0 ? this.event.end: new Date()
    }
    this.resetDate()
  }

  resetDate(){
    _.forEach(this.originalDateInfos, (val, key) => {
      const dateTime = this.splitDatetime(val)
      this.dateInfos[key] = {
        date: dateTime.year + "-" + dateTime.month + "-" + dateTime.day,
        hour: parseInt(dateTime.hour),
        minute: parseInt(dateTime.minute),
        showMenu: false,
        label: key === "start" ? "開始" : "終了"
      }
    })
  }

  cancel() {
    this.edit = false
    this.resetDate()
    this.$emit("close")
  }

  emit() {
    if(this.isNew) this.$emit("created", _.mapValues(this.dateInfos, this.formatDate))
    else if(this.isDelete) this.$emit("deleted", this.event.rsvnId)
    else {
      const updateInfo = Object.assign(
        _.mapValues(this.dateInfos, this.formatDate),
        {id: this.event.rsvnId, userId: this.event.user.id}
      )
      this.$emit("editted", updateInfo)
    }
    this.edit = false
    this.isDelete = false
  }

  deleteHandler() {
    this.isDelete = true
    this.emit()
  }

  editClicked() {
    this.edit = !this.edit
  }

  deleteClicked() {
    this.setConfirmation()
    this.showConfirm = true
  }

  setConfirmation() {
    const formattedDate = _.mapValues(this.dateInfos, this.formatDate)
    this.confirm = {
      title: "本当に予約を削除してもよいですか？",
      text: `
        <p>${this.event.name}</p>
        <p>開始時刻： ${formattedDate.start}</p>
        <p>終了時刻： ${formattedDate.end}</p>
      `
    }
  }

  isEditable() {
    return isLoginUser(this.event?.user.id) || isAdmin()
  }

  formatDate(d: DateInfo) {
    return new Date(`${d.date}T${d.hour}:${d.minute}:00+0900`)
  }

  splitDatetime(dateTime: Date) {
    const year   = dateTime.getFullYear().toString()
    const month  = (dateTime.getMonth() + 1).toString().padStart(2, "0")
    const day    = dateTime.getDate().toString().padStart(2, "0")
    const hour   = dateTime.getHours().toString().padStart(2, "0")
    const minute = dateTime.getMinutes().toString().padStart(2, "0")
    return {year, month, day, hour, minute}
  }
}
</script>