<template lang="pug">
  transition-group(name="notification-group" tag="div")
    v-snackbar(v-for="n in notifications" :key="n.id" value="true" :timeout="timeout(n)" top right :color="color(n)")
      div(align="right")
        v-btn.ma-0.pa-0.btn(x-small text @click="close(n)")
          v-icon.ma-0.pa-0.btn(small :color="color(n)+' darken-4'") close
      p.mt-0.mb-0(data-test="notification-message") {{ n.msg }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Notification } from "@/models/index"
import { notificationStore } from "@/store/index"

@Component({})
export default class NotificationPopup extends Vue {
  get notifications(): Notification[] {
    return notificationStore.getNotifications
  }

  color(n: Notification): string {
    return n.type === "error" ? "error" : "info"
  }

  close(n: Notification) {
    notificationStore.remove(n.id)
  }

  timeout(n: Notification): number {
    if (n.timeout > 0) {
      setTimeout(() => {
        this.close(n)
      }, n.timeout)
    }
    return -1 // always disable v-snackbar original timeout
  }
}
</script>

<style lang="stylus" scoped>
.notification-group-enter-active, .notification-group-leave-active
  transition all 0.4s
.notification-group-enter, .notification-group-leave-to
  opacity 0
  transform translateY(-30px)
.v-snack >>> .v-snack__action
  margin: 0
.v-snack >>> .v-snack__content
  padding: 8px 8px 8px 16px
.v-snack >>> .v-btn:before
  background-color: transparent
.btn:hover
  filter: drop-shadow(0px 0px 3px rgba(0,0,0,0.3))
</style>