<template>
  <div class="task-list-container">
    <div class="flex justify-between items-center mb-3">
      <h4 class="text-lg font-semibold">Zadania dla projektu</h4>
      <button v-if="canEdit" @click="$emit('addTask')" class="add-btn">Dodaj zadanie</button>
    </div>
    <div v-if="loading" class="loading">Ładowanie zadań...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="mb-2">
      <label>Status: </label>
      <select v-model="filterStatus">
        <option value="">Wszystkie</option>
        <option value="todo">Nowe</option>
        <option value="in-progress">W toku</option>
        <option value="done">Zakończone</option>
      </select>
    </div>
    <ul>
      <li v-for="task in filteredTasks" :key="task._id" class="task-item">
        <div class="flex justify-between items-center">
          <div>
            <router-link :to="`/task/${task._id}`" class="font-bold">{{ task.title }}</router-link>
            <span class="status" :class="task.status">{{ task.status }}</span>
            <span class="priority">{{ task.priority }}</span>
          </div>
          <div v-if="canEdit" class="space-x-2">
            <button @click="$emit('editTask', task)" class="edit-btn">Edytuj</button>
            <button @click="deleteTask(task._id)" class="delete-btn">Usuń</button>
          </div>
        </div>
      </li>
    </ul>
    <div v-if="!loading && !error && filteredTasks.length === 0" class="text-gray-500 mt-2">Brak zadań.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
const props = defineProps(['projectId'])
const emit = defineEmits(['addTask', 'editTask'])

const tasks = ref([])
const filterStatus = ref('')
const canEdit = ref(false)
const loading = ref(false)
const error = ref('')

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

const fetchTasks = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/tasks', { params: { projectId: props.projectId } })
    tasks.value = res.data
  } catch {
    error.value = 'Błąd pobierania zadań'
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const deleteTask = async (id) => {
  if (!confirm('Na pewno usunąć zadanie?')) return
  try {
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  } catch (err) {
    console.error(err)
  }
}

const filteredTasks = computed(() => {
  if (!filterStatus.value) return tasks.value
  return tasks.value.filter(t => t.status === filterStatus.value)
})

onMounted(() => {
  fetchTasks()
  const role = getRole()
  canEdit.value = role === 'admin' || role === 'manager'
})

// Odśwież zadania po dodaniu/edycji
if (emit) {
  emit('taskAdded', fetchTasks)
}
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
.task-list-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.10);
  padding: 1.2rem 1rem;
  margin-bottom: 1.2rem;
}
.add-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #1a232e;
}
.edit-btn {
  color: #2980b9;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  padding: 0.2rem 0.7rem;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #eaf3fa;
}
.delete-btn {
  color: #e74c3c;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  padding: 0.2rem 0.7rem;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #faeaea;
}
.status.todo {
  background: #e67e22;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.status.in-progress {
  background: #2980b9;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.status.done {
  background: #27ae60;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.priority {
  margin-left: 0.7rem;
  font-size: 0.95rem;
  color: #888;
}
</style>
