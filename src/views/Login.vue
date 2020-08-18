<template lang="pug">
  v-row(align="center" justify="center")
    v-col(cols=12 lg=4)
      v-card(elevation=0)
        v-card-title Login
        v-card-text
          v-text-field(v-model="loginInfo.email" label="e-mail")
          v-text-field(v-model="loginInfo.password" label="password")
        v-card-action
          v-btn(@click="login") emit
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Login extends Vue {
  loginInfo: {email: string; password: string } = { email: "", password: "" }

  login() {
    this.$store.dispatch("login", this.loginInfo)
    .then(() => this.letIn())
  }

  letIn(){
    this.$router.push(this.$route.query.redirect[0] || "/")
  }
}
</script>