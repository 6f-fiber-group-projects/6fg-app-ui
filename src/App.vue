<template lang="pug">
  v-app
    Header
    router-view
    NotificationPopup
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import NotificationPopup from "@/components/NotificationPopup.vue"
import Header from "@/components/Header.vue"

@Component({ components: { NotificationPopup, Header } })
export default class App extends Vue {}
</script>
