<template lang="pug">
  .user-detail
    v-card
      v-toolbar.mb-3(:color="titleColor" dark dense elevation=0)
        v-toolbar-title {{ titleText }}
      v-card-text
        v-form(ref="form" v-model="formValid" lazy-validation)
          v-text-field(v-model="name" label="ユーザー名" validate-on-blur :rules="nameRules()")
          v-text-field(v-model="email" label="メールアドレス" validate-on-blur :rules="emailRules()")
          //- v-checkbox(v-if="!isNew" v-model="editPassword" @click="eiditPasswordClicked" label="パスワードを変更する")
          v-text-field(v-model="password" v-if="showEditPassword" label="パスワード" validate-on-blur :rules="passwordRules()")
          v-radio-group(v-if="!isNew" v-model="authId" :disabled="!canEditAuth")
            v-radio(v-for="n in 3" :key="n" :value="n" :label="authLabel(n)")
      v-card-actions
        v-spacer
        v-btn(@click="cancel" depressed color="grey darken-2" dark) キャンセル
        v-btn(@click="emit" depressed :color="emitBtnColor") {{ emitBtnText }}
</template>

<script lang="ts">
import { Vue, Component, Prop, PropSync } from 'vue-property-decorator'
import { 
  isAdmin,
  isLoginUser,
  existSameUserName,
  existSameUserEmail,
  validatePassword,
  authNameToId,
  AUTH_ID_TO_NAME
} from "@/plugins/utils"
import { userStore } from '../store'

@Component({})
export default class UserDetailCard extends Vue {
  private formValid = true
  private name = ""
  private email = ""
  private password = ""
  private authId = 0
  private form: any
  private editPassword = false

  @Prop({type: Boolean, default: false})
  isNew!: boolean

  @Prop({type: Number, default: 0})
  userId!: number

  @PropSync("loading", {type: Boolean, default: false})
  emiting!: boolean

  mounted() {
    this.form = this.$refs.form as Vue
    this.initEditInfo()
  }

  get titleColor() {
    return this.isNew ? "primary" : "success"
  }

  get emitBtnColor() {
    return this.titleColor
  }

  get titleText() {
    return this.isNew ? "ユーザー登録" : "ユーザー編集"
  }

  get emitBtnText() {
    return this.isNew ? "登録" : "編集"
  }

  get showEditPassword() {
    // return this.isNew || this.editPassword
    return true || this.isNew || this.editPassword
  }

  get passwordEdited() {
    return this.editPassword || this.isNew
  }

  get userInfo() {
    const user: any = { name: this.name, email: this.email }
    if(this.password) user.password = this.password
    if(!this.isNew && this.userId) {
      user.id = this.userId
      user.authId = this.authId
    }
    return user
  }

  get canEditAuth() {
    // unable to change own auth to avoid the situation
    // where there is no admin user
    return isAdmin() && !isLoginUser(this.userId)
  }

  initEditInfo() {
    this.editPassword = false
    if(!this.isNew && this.userId) {
      const u = userStore.getUserById(this.userId)
      this.name = u.name
      this.email = u.email
      this.authId = authNameToId(u.auth) || 0
    }
  }

  initUser() {
    this.name = ""
    this.email = ""
    this.password = ""
    this.authId = 0
  }

  authLabel(id: number) {
    return AUTH_ID_TO_NAME[id]
  }

  nameRules() {
    return [
      (v: string) => !this.isEmpty(v) || "ユーザー名を入力してください。",
      (v: string) => !existSameUserName(this.userId, v) || "ユーザー名が使用されています。別のユーザー名を入力してください。"
    ]
  }

  emailRules() {
    return [
      (v: string) => !this.isEmpty(v) || "メールアドレスを入力してください。",
      (v: string) => !existSameUserEmail(this.userId, v) || "メールアドレスが使用されています。別のメールアドレスを入力してください。"
    ]
  }

  passwordRules() {
    return [
      (v: string) => !this.isEmpty(v) || "パスワードを入力してください。",
      (v: string) => validatePassword(v) || "大文字、小文字、記号、数字を含む８文字以上のパスワードを作成してください。"
    ]
  }

  isEmpty(s: string) {
    return s.length === 0
  }

  eiditPasswordClicked() {
    if(!this.editPassword) this.password = ""
  }

  cancel() {
    this.$emit("cancel")
    this.initUser()
    this.initEditInfo()
  }

  emit() {
    this.emiting = true
    if(!this.form.validate()) return
    if(this.isNew) this.$emit("produced", this.userInfo)
    else this.$emit("edited", this.userInfo)
    this.initUser()
    this.initEditInfo()
  }
}
</script>