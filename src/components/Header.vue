<template lang="pug">
  .mb-16
    v-navigation-drawer(v-if="isLogin" v-model="drawer" app)
      v-list(dense)
        v-list-item(link)
          v-list-item-action
            v-icon mdi-home
          v-list-item-content
            v-list-item-title Home
      template(v-slot:append)
        .pa-2
          v-btn(block dark color="black" @click="logout" ) Logout

    v-app-bar(app color="primary" dark)
      v-app-bar-nav-icon(v-if="isLogin" @click.stop="drawer = !drawer")
      router-link(to="/")
        v-toolbar-title.white--text Fiber App
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { authStore } from "@/store/index"

@Component({})
export default class Header extends Vue {
  private drawer = false

  get isLogin() {
    return authStore.isLogin
  }

  logout() {
    authStore.logout()
    .then(() => this.$router.push("/login"))
  }
}
</script>