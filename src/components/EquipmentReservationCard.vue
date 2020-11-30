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
          v-select(v-model="selectedEquip" :items="equips" :disabled="!canSelectEquip"
              return-object item-text="name" label="実験装置" :rules="rulesHandler('equip')")
          v-row(v-for="(item, key, idx) in dateInfos" :key="idx")
            v-col.py-0(cols=12) {{ item.label }}
            v-col(cols=6)
              v-menu(v-model="item.spacer" ref="date" :close-on-content-click="false" 
                  transition="scale-transition" offset-y :disabled="!editting")
                template(v-slot:activator="{ on, attrs }")
                  v-text-field(v-model="item.date" v-on="on" v-bind="attrs" readonly label="日付" prepend-icon="event"
                    :rules="rulesHandler(key)" :disabled="!editting")
                v-date-picker(v-model="item.date" no-title scrollable)
            v-col(cols=3)
              v-select(v-model="item.hour" :items="hours" :disabled="!editting" :rules="rulesHandler(key)" label="時刻（時）")
            v-col(cols=3)
              v-select(v-model="item.minute" :items="minutes" :disabled="!editting" :rules="rulesHandler(key)" label="時刻（分）")
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit(isNew ? 'created' : 'edited')" depressed :color="color" :disabled="!editting || !canSubmit" 
            :loading="emiting" :dark="editting && canSubmit") {{ emitBtnText }}

    v-dialog(v-model="showConfirm"  max-width="300px")
      ConfirmCard(emitBtnText="削除" :loading.sync="emiting" @cancel="showConfirm=false" @emit="emit('deleted')")
        template(#title) {{ confirm.title }}
        template(#text) {{ confirm.text }}

</template>

<script lang="ts">
import { Vue, Component, Prop, PropSync, Watch } from 'vue-property-decorator'
import { CalendarEvent, RsvnInfo } from '../models/types'
import { isLoginUser, isAdmin, splitDatetime } from "@/plugins/utils"
import { authStore, equipStore } from '../store'
import ConfirmCard from "@/components/ConfirmCard.vue"
import Reservation from "@/plugins/reservation"
import _ from "lodash"
import { EquipmentInfo } from '../models'

type DateInfo = {
  date: string;
  hour: number;
  minute: number;
  showMenu: boolean;
  label: string;
}

@Component({ components: { ConfirmCard } })
export default class ReservationCard extends Vue {
  private isEdit = false
  private dateInfos: {[s: string]: DateInfo | null} = {start: null, end: null} // https://vuejs.org/2016/02/06/common-gotchas/#Why-isn%E2%80%99t-the-DOM-updating
  private originalDateInfos: {[s: string]: Date} = {}
  private showConfirm = false
  private confirm = {title: "", text: ""}
  private dateValidater: any = null
  private selectedEquip: any = null
  private rsvn = new Reservation()

  @Prop({type: Object, default: () => ({})})
  event!: CalendarEvent

  @Prop({type: Boolean, default: false})
  isNew!: boolean

  @Prop({type: Boolean, default: false})
  dialog!: boolean

  @Prop({type: Number, default: null})
  equipId!: number

  @Prop({type: Array, default: null})
  preRsvns!: RsvnInfo[]

  @PropSync("loading", {type: Boolean, default: false})
  emiting!: boolean

  beforeMount() {
    this.initDateInfo()
  }

  mounted() {
    this.dateValidater = this.$refs.dateForm
    this.onDialogChange()
  }

  @Watch("event")
  onEventChange(){
    this.initDateInfo()
  }

  @Watch("dialog")
  onDialogChange(){
    const selectedEquip = this.equips.filter(e => e.id === this.equipId)[0] || this.equips[0]
    if(selectedEquip) this.selectedEquip = selectedEquip
    if(selectedEquip && this.dialog) this.initRsvn(selectedEquip.id)
  }

  @Watch("selectedEquip")
  async onSelectedEquipChange(equip: EquipmentInfo){
    if(equip) await this.initRsvn(equip.id)
  }

  get color() {
    if(this.isNew) return "primary"
    else if(this.canEdit && this.canManage) return "success"
    return "grey darken-2"
  }

  get editting() {
    return this.isNew || this.isEdit
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
    return this.rsvn.CanManageBook(this.formatDate(this.dateInfos.end))
  }

  get needRules() {
    return this.canManage && this.editting
  }

  get rulesHandler() {
    return (type: string) => {
      if(!this.needRules) return []
      const rules = 
          type === "start" ? this.startRules
          : type === "end" ? this.endRules
          : this.equipRules
      this.dateValidater?.validate()
      return rules
    }
  }

  get startRules() {
    return this.bookRules("start")
  }

  get endRules() {
    return this.bookRules("end")
  }

  get equipRules() {
    return [this.selectedEquip !== null || "実験装置を選択してください"]
  }

  get canSelectEquip() {
    return this.equipId === null
  }

  get equips() {
    return equipStore.getEquipsInfo
  } 

  get rsvnInfo() {
    return Object.assign(
      _.mapValues(this.dateInfos, this.formatDate),
      {
        id: this.event?.rsvnId,
        userId: this.event.user?.id,
        equipId: this.selectedEquip?.id
      }
    )
  }

  async initRsvn(equipId: number) {
    await this.rsvn.Initialize(equipId)
  }

  initDateInfo() {
    this.originalDateInfos = this.setDateInfo(this.event)
    this.resetDate()
  }

  setDateInfo(e: CalendarEvent) {
    let date: {start: Date; end: Date}
    if(Object.keys(e).length === 0) {
      const start = new Date()
      const end = new Date()
      end.setMinutes(end.getMinutes() + 30)
      date = {start, end}
    }
    else date = {start: e.start, end: e.end}
    return date
  }

  resetDate(){
    _.forEach(this.originalDateInfos, (val, key) => {
      const dateTime = splitDatetime(val)
      this.dateInfos[key] = {
        date: dateTime.year + "-" + dateTime.month + "-" + dateTime.day,
        hour: parseInt(dateTime.hour),
        minute: parseInt(dateTime.minute),
        showMenu: false,
        label: key === "start" ? "開始" : "終了",
      }
    })
  }

  bookRules(type: string) {
    return this.dateInfos.start && this.dateInfos.end
      ? this.rsvn.BookRules(
          this.formatDate(this.dateInfos.start),
          this.formatDate(this.dateInfos.end),
          type,
          this.event?.rsvnId,
          this.preRsvns
        )
      :[]
  }

  cancel() {
    this.isEdit = false
    this.resetDate()
    this.$emit("close")
  }

  emit(type: string) {
    this.emiting = true
    this.$emit(type, this.rsvnInfo)
    this.isEdit = false
  }

  editClicked() {
    this.isEdit = !this.isEdit
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
    return new Date(`${d.date}T${hourStr}:${minuteStr}:00+09:00`)
  }
}
</script>