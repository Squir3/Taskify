<template>
  <div class="profile-container">
    <h2 class="text-2xl font-bold mb-4">Twój profil</h2>
    <div v-if="loading" class="loading">Ładowanie profilu...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <template v-if="!loading && !error">
      <div class="mb-2"><strong>Email:</strong> {{ user?.email }}</div>
      <div class="mb-2"><strong>Rola:</strong> {{ user?.role }}</div>
      <!-- Usunięto sekcję z zadaniami -->
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const user = ref(null)
const loading = ref(false)
const error = ref('')

const getUser = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/users/me')
    user.value = res.data
  } catch {
    error.value = 'Błąd pobierania profilu'
  } finally {
    loading.value = false
  }
}

onMounted(getUser)
</script>

<style scoped>
.loading {
  color: #2980b9;
  font-weight: bold;
  margin-bottom: 1rem;
}
.error {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
}
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.10);
  padding: 2rem 1.5rem;
}
</style>
