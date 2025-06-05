<template>
  <div class="tasks-view-container">
    <h2 class="text-2xl font-bold mb-4">Wszystkie Twoje zadania</h2>
    <Loader v-if="loading" />
    <ErrorMessage :message="error" />
    <ul v-if="!loading && !error">
      <li v-for="task in tasks" :key="task._id" class="task-row">
        <router-link :to="`/task/${task._id}`">{{ task.title }}</router-link>
        <span class="status" :class="task.status">{{ task.status }}</span>
        <span class="priority">{{ task.priority }}</span>
      </li>
    </ul>
    <div v-if="!loading && !error && tasks.length === 0" class="text-gray-500 mt-2">
      Brak zadań.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import Loader from '../components/Loader.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const tasks = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/tasks/me')
    tasks.value = res.data
  } catch {
    error.value = 'Błąd pobierania zadań'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tasks-view-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.7rem;
}
.status {
  padding: 0.2rem 0.7rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: white;
}
.status.todo {
  background: #e67e22;
}
.status.in-progress {
  background: #2980b9;
}
.status.done {
  background: #27ae60;
}
.priority {
  margin-left: 0.7rem;
  font-size: 0.95rem;
  color: #888;
}
</style>
