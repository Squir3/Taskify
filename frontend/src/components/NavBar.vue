<template>
  <nav class="navbar">
    <div class="navbar-left">
      <h1>Taskify</h1>
    </div>
    <div class="navbar-right">
      <template v-if="isLoggedIn">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/projects">Projekty</router-link>
        <router-link to="/profile">Profil</router-link>
        <button @click="logout" class="logout-btn">Wyloguj</button>
      </template>
      <template v-else>
        <router-link :to="{ path: '/auth', query: { mode: 'login' } }">Logowanie</router-link>
        <router-link :to="{ path: '/auth', query: { mode: 'register' } }">Rejestracja</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)

const checkAuth = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

const logout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  router.push({ path: '/auth', query: { mode: 'login' } })
}

onMounted(() => {
  checkAuth()
  window.addEventListener('storage', checkAuth)
})

watch(
  () => route.fullPath,
  () => {
    checkAuth()
  },
)
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 1rem 2rem;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.navbar-right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.router-link-active {
  text-decoration: underline;
}
.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.logout-btn:hover {
  background: #c0392b;
}
@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    font-size: 1.1rem;
  }
  .navbar-right {
    gap: 0.7rem;
    margin-top: 0.5rem;
  }
}
</style>
