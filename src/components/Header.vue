<template lang="pug">
  .mb-16
    v-navigation-drawer(v-if="isLogin" v-model="drawer" app)
      v-list(dense)
        v-list-item(link to="/" @click="selected")
          v-list-item-action
            v-icon mdi-home
          v-list-item-content
            v-list-item-title ホーム
        v-list-item(link :to="userPageUrl" @click="selected")
          v-list-item-action
            v-icon person
          v-list-item-content
            v-list-item-title ユーザーページ
        v-list-item(link to="/user" @click="selected")
          v-list-item-action
            v-icon people
          v-list-item-content
            v-list-item-title ユーザー一覧
      template(v-slot:append)
        .pa-2
          v-btn(block dark color="black" @click="logout" ) Logout

    v-app-bar(app color="primary" dark)
      v-app-bar-nav-icon(v-if="isLogin" @click.stop="drawer = !drawer")
      router-link(to="/")
        v-toolbar-title.white--text(@click="selected") Fiber App
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

  get userPageUrl() {
    const userId = authStore.getUserInfo?.id
    return `/user/${userId}`
  }

  selected() {
    this.drawer = false
  }

  logout() {
    authStore.logout()
  }
}
</script>