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
        v-form(ref="dateForm")
          v-row(v-for="(item, key, idx) in dateInfos" :key="idx")
            v-col.py-0(cols=12) {{ item.label }}
            v-col(cols=6)
              v-menu(v-model="item.spacer" ref="date" :close-on-content-click="false" 
                  transition="scale-transition" offset-y :disabled="!editting")
                template(v-slot:activator="{ on, attrs }")
                  v-text-field(v-model="item.date" v-on="on" v-bind="attrs" readonly label="日付" prepend-icon="event"
                    :rules="item.rules" :disabled="!editting")
                v-date-picker(v-model="item.date" no-title scrollable)
            v-col(cols=3)
              v-select(v-model="item.hour" :items="hours" :disabled="!editting" :rules="item.rules" label="時刻（時）")
            v-col(cols=3)
              v-select(v-model="item.minute" :items="minutes" :disabled="!editting" :rules="item.rules" label="時刻（分）")
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit" depressed :color="color" :disabled="!editting || !canSubmit" 
            :loading="emiting" :dark="editting && canSubmit") {{ emitBtnText }}

    v-dialog(v-model="showConfirm"  max-width="300px")
      ConfirmCard(emitBtnText="削除" :loading.sync="emiting" @cancel="showConfirm=false" @emit="deleteHandler")
        template(#title) {{ confirm.title }}
        template(#text) {{ confirm.text }}

</template>

<script lang="ts">
import { Vue, Component, Prop, PropSync, Watch } from 'vue-property-decorator'
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
  rules: Array<Function>;
}

@Component({ components: { ConfirmCard } })
export default class Calendar extends Vue {
  private edit = false
  private dateInfos: {[s: string]: DateInfo | null} = {start: null, end: null} // https://vuejs.org/2016/02/06/common-gotchas/#Why-isn%E2%80%99t-the-DOM-updating
  private originalDateInfos: {[s: string]: Date} = {}
  private isDelete = false
  private showConfirm = false
  private confirm = {title: "", text: ""}
  private dateValidater: any = null

  @Prop({type: Object, default: () => ({})})
  event!: CalendarEvent

  @Prop({type: Array, default: () => ([])})
  rsvnEvents!: CalendarEvent[]

  @Prop({type: Boolean, default: false})
  isNew!: boolean

  @PropSync("loading", {type: Boolean, default: false})
  emiting!: boolean

  beforeMount() {
    this.initDateInfo()
  }

  mounted() {
    this.dateValidater = this.$refs.dateForm
  }

  @Watch("event")
  onEventChange(){
    this.initDateInfo()
  }

  get color() {
    if(this.isNew) return "primary"
    else if(this.canEdit && this.canManage) return "success"
    return "grey darken-2"
  }

  get editting() {
    return this.isNew || this.edit
  }

  get canEdit() {
    return isLoginUser(this.event?.user.id) || isAdmin()
  }

  get showManageBtn() {
    return !this.isNew && this.canEdit && this.canManage
  }

  get hours() {
    return Array.from(Array(24), (v, k) => k)
  }

  get minutes() {
    return Array.from(Array(60), (v, k) => k)
  }

  get emitBtnText() {
    return this.isNew ? "予約" : "編集"
  }

  get cardTile() {
    return this.isNew ? authStore.getUserInfo?.name : this.event.name
  }

  get canSubmit() {
    if(!this.dateValidater) return false
    return this.dateValidater.validate()
  }

  get canManage() {
    if(!this.dateInfos.end) return false
    return this.formatDate(this.dateInfos.end).getDate() > new Date().getDate()
  }

  initDateInfo() {
    this.originalDateInfos = this.setDateInfo(this.event)
    this.resetDate()
  }

  setDateInfo(e: CalendarEvent) {
    let date: {start: Date; end: Date}
    if(Object.keys(e).length === 0) {
      const start = new Date()
      const end = new Date
      end.setMinutes(end.getMinutes() + 30)
      date = {start, end}
    }
    else date = {start: e.start, end: e.end}
    return date
  }

  resetDate(){
    _.forEach(this.originalDateInfos, (val, key) => {
      const dateTime = this.splitDatetime(val)
      this.dateInfos[key] = {
        date: dateTime.year + "-" + dateTime.month + "-" + dateTime.day,
        hour: parseInt(dateTime.hour),
        minute: parseInt(dateTime.minute),
        showMenu: false,
        label: key === "start" ? "開始" : "終了",
        rules: key === "start" 
          ? [
              () => this.afterNow() || "現在時刻より前の日時は指定できません",
              () => this.canBook("start") || "予約時間がかぶっています"
            ]
          : [
              () => this.afterStart() || "利用開始時刻より前の日時は指定できません",
              () => this.canBook("end") || "予約時間がかぶっています"
            ]
      }
    })
  }

  afterNow() {
    if(!this.isNew && !this.canManage) return true // not check unmanageable case
    if(!this.dateInfos.start) return "Invalid start date info"
    const isAfter = this.formatDate(this.dateInfos.start).getTime() > (new Date().getTime() - 60*1000)
    if(!isAfter) console.log(this.dateInfos)
    return isAfter
  }

  afterStart() {
    if(!this.isNew && !this.canManage) return true // not check unmanageable case
    if(!this.dateInfos.start || !this.dateInfos.end) return "Invalid date info"
    const isAfter = this.formatDate(this.dateInfos.end).getTime() > this.formatDate(this.dateInfos.start).getTime()
    if(!isAfter) console.log(this.dateInfos)
    return isAfter
  }

  canBook(type: string) {
    if(!this.dateInfos.start || !this.dateInfos.end) return "Invalid date info"
    const inputSt = this.formatDate(this.dateInfos.start).getTime()
    const inputEd = this.formatDate(this.dateInfos.end).getTime()

    for(const r of this.rsvnEvents) {
      if(this.event && this.event.rsvnId === r.rsvnId) continue
      const date = this.setDateInfo(r)
      const st = date.start.getTime()
      const ed = date.end.getTime()

      if(type === "start" && (st < inputSt && inputSt < ed)) return false 
      else if((st < inputEd && inputEd < ed) || (inputSt < st && ed < inputEd)) return false
    }

    return true
  }

  cancel() {
    this.edit = false
    this.resetDate()
    this.$emit("close")
  }

  emit() {
    this.emiting = true
    if(this.isNew) this.$emit("created", _.mapValues(this.dateInfos, this.formatDate))
    else if(this.isDelete) this.$emit("deleted", this.event.rsvnId)
    else {
      const updateInfo = Object.assign(
        _.mapValues(this.dateInfos, this.formatDate),
        {id: this.event.rsvnId, userId: this.event.user.id}
      )
      this.$emit("edited", updateInfo)
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

  formatDate(d: DateInfo) {
    const hourStr = d.hour.toString().padStart(2, "0")
    const minuteStr = d.minute.toString().padStart(2, "0")
    return new Date(`${d.date}T${hourStr}:${minuteStr}:00+0900`)
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