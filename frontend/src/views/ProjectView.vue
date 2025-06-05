<template>
  <div class="project-view-container" v-if="project">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">{{ project.name }}</h2>
      <div v-if="canEdit" class="space-x-2">
        <button @click="showForm = true" class="edit-btn">Edytuj</button>
        <button @click="deleteProject" class="delete-btn">Usuń</button>
      </div>
    </div>
    <div class="mb-2 text-gray-600">{{ project.description }}</div>
    <div class="mb-4">
      <strong>Członkowie zespołu:</strong>
      <span v-if="teamMembers.length === 0">Brak</span>
      <span v-else>{{ teamMembers.map(u => u.email).join(', ') }}</span>
    </div>
    <h3 class="text-lg font-semibold mb-2">Zadania</h3>
    <TaskList :projectId="project._id" @addTask="showTaskForm = true" />
    <TaskForm v-if="showTaskForm && canEdit" :projectId="project._id" @saved="onTaskSaved" @close="showTaskForm = false" />
    <ProjectForm v-if="showForm" :editProject="project" @close="showForm = false" @saved="reloadProject" />
  </div>
  <div v-else class="text-gray-500">Ładowanie...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import TaskList from '../components/TaskList.vue'
import TaskForm from '../components/TaskForm.vue'
import ProjectForm from '../components/ProjectForm.vue'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const teamMembers = ref([])
const showForm = ref(false)
const canEdit = ref(false)
const showTaskForm = ref(false)

const getRole = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch {
    return null
  }
}

const fetchProject = async () => {
  try {
    const res = await api.get(`/projects/${route.params.id}`)
    project.value = res.data
    if (res.data.teamId) {
      const teamRes = await api.get(`/teams/${res.data.teamId}`)
      teamMembers.value = teamRes.data.members || []
    } else {
      teamMembers.value = []
    }
  } catch {
    project.value = null
  }
}

const deleteProject = async () => {
  if (!confirm('Na pewno usunąć projekt?')) return
  try {
    await api.delete(`/projects/${route.params.id}`)
    router.push('/projects')
  } catch (err) {
    console.error(err)
  }
}

const reloadProject = () => {
  showForm.value = false
  fetchProject()
}
const reloadTasks = () => {
  // TaskList powinien sam się odświeżyć po dodaniu zadania
  // Jeśli nie, można dodać ref do TaskList i wywołać fetchTasks()
}

function onTaskSaved() {
  showTaskForm.value = false
  reloadTasks()
}

onMounted(() => {
  fetchProject()
  const role = getRole()
  canEdit.value = role === 'admin' || role === 'manager'
})
</script>

<style scoped>
.project-view-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.edit-btn {
  color: #2980b9;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.delete-btn {
  color: #e74c3c;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
</style>
