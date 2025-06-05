<template>
  <div class="dashboard-container">
    <h2>Witaj w Task Manager!</h2>
    <div v-if="loading" class="loading">Ładowanie danych...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error" class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Twoje projekty</h3>
        <ul>
          <li v-for="project in projects" :key="project._id">
            <router-link :to="`/project/${project._id}`">{{ project.name }}</router-link>
          </li>
        </ul>
        <router-link to="/projects" class="dashboard-link">Zobacz wszystkie projekty</router-link>
      </div>
      <div class="dashboard-card">
        <h3>Twoje zadania</h3>
        <ul>
          <li v-for="task in tasks" :key="task._id">
            <router-link :to="`/task/${task._id}`">{{ task.title }}</router-link>
            <span class="status" :class="task.status">{{ task.status }}</span>
          </li>
        </ul>
        <router-link to="/tasks" class="dashboard-link">Zobacz wszystkie zadania</router-link>
      </div>
      <div class="dashboard-card">
        <h3>Aktywność</h3>
        <ul>
          <li v-for="activity in activityFeed" :key="activity.id">
            {{ activity.text }}
          </li>
        </ul>
      </div>
      <div v-if="isAdmin && !loading && !error" class="dashboard-card">
        <h3>Panel administracyjny</h3>
        <router-link to="/admin" class="dashboard-link">Przejdź do panelu admina</router-link>
      </div>
      <div v-if="isManager && !loading && !error" class="dashboard-card">
        <h3>Panel managera</h3>
        <router-link to="/manager" class="dashboard-link">Przejdź do panelu managera</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const projects = ref([])
const tasks = ref([])
const comments = ref([])
const activityFeed = ref([])
const loading = ref(false)
const error = ref('')
const isAdmin = ref(false)
const isManager = ref(false)
const router = useRouter()

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const projectsRes = await api.get('/projects')
    projects.value = projectsRes.data
    // Zamiast wszystkich zadań pobierz tylko przypisane do użytkownika
    const tasksRes = await api.get('/tasks/me')
    tasks.value = tasksRes.data.slice(0, 5)
    const commentsRes = await api.get('/comments')
    comments.value = commentsRes.data.slice(0, 5)
    activityFeed.value = [
      ...tasks.value.map((t) => ({ id: t._id, text: `Nowe zadanie: ${t.title}` })),
      ...comments.value.map((c) => ({ id: c._id, text: `Nowy komentarz: ${c.content}` })),
    ].slice(0, 5)
    const token = localStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      isAdmin.value = payload.role === 'admin'
      isManager.value = payload.role === 'manager'
    }
  } catch (e) {
    if (e.response && e.response.status === 401) {
      error.value = 'Brak autoryzacji. Zaloguj się ponownie.'
      router.replace('/auth')
      return
    } else {
      error.value = 'Błąd ładowania danych do dashboardu'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.dashboard-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.08);
  padding: 1.5rem 1.2rem;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.dashboard-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
.dashboard-link {
  margin-top: 1.2rem;
  color: #2c3e50;
  font-weight: bold;
  text-decoration: underline;
  font-size: 1rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status {
  padding: 0.2rem 0.7rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: white;
  margin-left: 0.7rem;
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
@media (max-width: 700px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
