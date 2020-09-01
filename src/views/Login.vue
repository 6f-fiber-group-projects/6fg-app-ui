<template lang="pug">
  v-row(align="center" justify="center")
    v-col(cols=12 lg=4)
      v-card(elevation=0)
        v-card-title Login
        v-card-text
          v-text-field(v-model="loginInfo.email" label="e-mail")
          v-text-field(v-model="loginInfo.password" label="password")
        v-card-actions.justify-center
          v-btn.px-10.primary(rounded @click="login" :disabled="!canLogin") login
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { authStore } from "@/store/index"

@Component({})
export default class Login extends Vue {
  loginInfo: {email: string; password: string } = { email: "", password: "" }

  get canLogin() {
    return this.loginInfo.email && this.loginInfo.password
  }

  login() {
    authStore.login(this.loginInfo)
    .then(() => this.letIn())
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