<template lang="pug">
  v-app
    router-view
    Notification
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Notification from "@/components/Notification.vue"

@Component({components: {Notification}})
export default class App extends Vue {}
</script>
