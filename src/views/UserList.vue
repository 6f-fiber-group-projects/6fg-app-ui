<template lang="pug">
  v-container
    v-row.page-wrapper.mx-auto.my-8
      v-col(cols=12 v-if="isAdmin")
        v-btn.px-10.primary(rounded @click="create") 新規登録
      v-col(cols=12)
        v-data-table(:headers="headers" :items="users" item-key="name")
          template(v-slot:item.actions="{ item }")
            v-icon(v-if="!isLoginUser(item.id) && isAdmin" small @click="edit(item.id)") mdi-pencil

    v-dialog(v-model="showUserCreate" max-width="600px")
      UserDetailCard(:isNew="isNewUser" :userId="userId" :loading.sync="emiting" @produced="produced" @edited="edited" @cancel="closeUserCreate")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { userStore, appStore } from '../store'
import { UserCreate, UserUpdate } from '../models/types'
import { isAdmin, isLoginUser } from "@/plugins/utils"
import UserDetailCard from "@/components/UserDetailCard.vue"
import api from "@/api" 
import _ from "lodash"

@Component({ components: { UserDetailCard }})
export default class UserList extends Vue {
  private showUserCreate = false
  private isNewUser = false
  private headers = [
    { text: "ID", value: "id", sortable: false, },
    { text: "ユーザー名", value: "name", sortable: false, },
    { text: "メールアドレス", value: "email", sortable: false, },
    { text: "権限", value: "auth", sortable: false, },
    { text: "編集", value: "actions", sortable: false, },
  ]
  private userId = 0
  private emiting = false

  async mounted() {
    await this.initialLoad()
    userStore.subscribe()
  }

  beforeDestroy() {
    userStore.unsubscribe()
  }

  get isAdmin() {
    return isAdmin()
  }

  get users() {
    return _.sortBy(userStore.getUsers, "id")
  }

  async initialLoad() {
    appStore.onLoading()
    await this.fetchUsers()
    appStore.offLoading()
  }

  async fetchUsers() {
    await userStore.fetchUsers()
  }

  async create() {
    await this.fetchUsers()
    this.isNewUser = true
    this.showUserCreate = true
  }

  edit(userId: number) {
    this.userId = userId
    this.isNewUser = false
    this.showUserCreate = true
  }

  async produced(u: UserCreate) {
    await api.createUser(u)
    .finally(() => this.emiting = false)
    await this.fetchUsers()
    this.closeUserCreate()
  }

  async edited(u: UserUpdate) {
    await api.updateUser(u)
    .finally(() => this.emiting = false)
    await this.fetchUsers()
    this.closeUserCreate()
  }

  isLoginUser(userId: number) {
    return isLoginUser(userId)
  }

  closeUserCreate() {
    this.userId = 0
    this.isNewUser = false
    this.showUserCreate = false
  }
}
</script>

<style lang="stylus" scoped>
.page-wrapper
  max-width 1000px
  .title-wrapper
    max-height 100px
</style>