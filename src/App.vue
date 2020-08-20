<template lang="pug">
  v-app
    router-view
    NotificationPopup
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import NotificationPopup from "@/components/NotificationPopup.vue"

@Component({ components: { NotificationPopup } })
export default class App extends Vue {}
</script>
