<template lang="pug">
  .calendar
    v-sheet
      v-toolbar(flat)
        v-btn.mr-4(outlined :color="baseBtnColor" @click="setToday") Today
        v-btn(fab text small :color="baseBtnColor" @click="prev")
          v-icon(small) mdi-chevron-left
        v-btn(fab text small :color="baseBtnColor" @click="next")
          v-icon(small) mdi-chevron-right
        v-toolbar-title(v-if="calendar") {{ calendar.title }}
        v-spacer
        v-menu(bottom right)
          template(v-slot:activator="{ on, attrs }")
            v-btn(outlined v-on="on" v-bind="attrs" :color="baseBtnColor")
              span {{ type }}
              v-icon(right) mdi-menu-down
          v-list
            template(v-for="(type, idx) in availableTypes" key=idx)
              v-list-item(@click="setType(type)")
                v-list-item-title {{ cap(type) }}
    v-sheet
      v-calendar(v-model="focus" :type="type" :events="events"
          @click:event="eventSelected" color="primary" ref="calendar")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { RsvnInfo } from '../models/types'
import { capitalize } from "@/plugins/utils"
import _ from "lodash"
import { userStore } from '../store'

@Component({})
export default class Calendar extends Vue {
  private baseBtnColor = "grey darken-2"
  private calendar: any = ""
  private focus = ""
  private type = "month"
  private users: any
  private readonly availableTypes = ["month", "week", "day"]

  @Prop({type: Number})
  private equipId!: number

  @Prop({type: Array, default: () => ([])})
  private rsvns!: RsvnInfo[]

  mounted() {
    this.calendar = this.$refs.calendar 
  }

  get events () {
    return _.map(this.rsvns, (r: any) => {
      const name = userStore.getUserById(r.userId)?.name || "unknown"
      return Object.assign(r, { name })
    })
  }

  setToday () {
    this.focus = ""
  }

  prev () {
    this.calendar.prev()
  }

  next () {
    this.calendar.next()
  }

  setType(type: string) {
    this.type = type
  }

  eventSelected(e: any) {
    this.$emit("eventSelected", e)
  }

  cap(str: string) {
    return capitalize(str)
  }
}
</script>