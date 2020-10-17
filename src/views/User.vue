<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8
      v-col(cols=12)
        v-btn.px-10.success(rounded @click="edit") 編集
      v-col(cols=12)
        v-simple-table
          template(v-slot:default)
            tbody
              tr
                td ユーザー名
                td {{ user.name }}
              tr
                td メールアドレス
                td {{ user.email }}
              tr
                td 権限
                td {{ user.auth }}

    v-dialog(v-model="showUserEdit" max-width="600px")
      UserDetailCard(:userId="userId" :loading.sync="emiting" @edited="edited" @cancel="closeUserCreate")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { authStore, appStore } from '../store'
import UserDetailCard from "@/components/UserDetailCard.vue"
import { UserUpdate } from '../models/types'
import api from "@/api" 

@Component({ components: { UserDetailCard }})
export default class User extends Vue {
  private userId = 0
  private showUserEdit = false
  private emiting = false

  mounted() {
    appStore.onLoading()
    this.userId = parseInt(this.$route.params.userId)
  }

  updated() {
    appStore.offLoading()
  }

  get user() {
    return authStore.getUserInfo
  }

  edit() {
    this.showUserEdit = true
  }

  async edited(u: UserUpdate) {
    await api.updateUser(u)
    .then(d => authStore.setUserInfo(d.data.message))
    .finally(() => this.emiting = false)
    this.closeUserCreate()
  }

  closeUserCreate() {
    this.showUserEdit = false
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>