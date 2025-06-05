<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="w-full">
      <NavBar />
    </div>
    <Loader v-if="showLoader" />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Loader from './components/Loader.vue'
import socket from './notifications'
import { useToast } from 'vue-toastification'
import mitt from 'mitt'

export const emitter = mitt()

export default {
  components: {
    NavBar,
    Loader,
  },
  data() {
    return { showLoader: false }
  },
  created() {
    emitter.on('show-loader', () => { this.showLoader = true })
    emitter.on('hide-loader', () => { this.showLoader = false })
  },
  mounted() {
    const toast = useToast()
    socket.on('taskNotification', (task) => {
      toast.info('Nowe zadanie lub zmiana: ' + (task.title || ''))
    })
    socket.on('commentNotification', (comment) => {
      toast.success('Nowy komentarz: ' + (comment.content || ''))
    })
  },
}
</script>
