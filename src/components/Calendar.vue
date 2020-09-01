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
                v-list-item-title {{ capitalize(type) }}
    v-sheet
      v-calendar(v-model="focus" :type="type" color="primary" ref="calendar")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class Calendor extends Vue {
  private baseBtnColor = "grey darken-2"
  private calendar: any = ""
  private focus = ""
  private type = "month"
  private readonly availableTypes = ["month", "week", "day"]

  mounted() {
    this.calendar = this.$refs.calendar
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
    this.type =type
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

}
</script>