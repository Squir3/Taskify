<template>
  <div class="project-list-container">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Projekty</h2>
    </div>
    <div v-if="loading" class="loading">Ładowanie projektów...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error && projects.length === 0" class="text-gray-500">Brak projektów.</div>
    <div v-for="project in projects" :key="project._id" class="project-card">
      <div class="flex justify-between items-center">
        <router-link :to="`/project/${project._id}`" class="project-title">{{ project.name }}</router-link>
      </div>
      <div class="text-gray-600 mt-1">{{ project.description }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const projects = ref([])
const loading = ref(false)
const error = ref('')

const fetchProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/projects')
    projects.value = res.data
  } catch (e) {
    if (e.response && e.response.status === 401) {
      error.value = 'Brak autoryzacji. Zaloguj się ponownie.'
    } else {
      error.value = 'Błąd pobierania projektów'
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)
</script>

<style scoped>
.project-list-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
