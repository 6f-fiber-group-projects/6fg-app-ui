<template lang="pug">
  v-row(align="center" justify="center")
    v-col(cols=12 lg=4)
      v-card(elevation=0)
        v-card-title Login
        v-card-text
          v-text-field(v-model="loginInfo.email" label="e-mail")
          v-text-field(v-model="loginInfo.password" label="password")
        v-card-actions
          v-btn(@click="login") login
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { authStore, notificationStore } from "@/store/index"

@Component({})
export default class Login extends Vue {
  loginInfo: {email: string; password: string } = { email: "", password: "" }

  login() {
    authStore.login(this.loginInfo)
    .then(() => this.letIn())
    .then(() => notificationStore.info("Successfully login"))
    .catch(() => notificationStore.error("Failed to login"))
  }

  letIn(){
    this.$router.push(
      this.$route.query.redirect
        ? this.$route.query.redirect[0] || "/"
        : "/"
    )
  }
}
</script>