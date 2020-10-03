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
      UserDetailCard(:userId="userId" @edited="edited" @cancel="closeUserCreate")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { authStore } from '../store'
import UserDetailCard from "@/components/UserDetailCard.vue"
import { UserUpdate } from '../models/types'
import api from "@/api" 

@Component({ components: { UserDetailCard }})
export default class User extends Vue {
  private userId = 0
  private showUserEdit = false

  mounted() {
    this.userId = parseInt(this.$route.params.userId)
  }

  get user() {
    return authStore.getUserInfo
  }

  edit() {
    this.showUserEdit = true
  }

  async edited(u: UserUpdate) {
    await api.updateUser(u)
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