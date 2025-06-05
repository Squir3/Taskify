<template>
  <div class="task-form-container">
    <h4 class="mb-2">{{ editTask ? 'Edytuj zadanie' : 'Dodaj zadanie' }}</h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Tytuł</label>
        <input v-model="form.title" required :disabled="!isAdminOrManager" />
      </div>
      <div class="form-group">
        <label>Opis</label>
        <textarea v-model="form.description" rows="2" :disabled="!isAdminOrManager"></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="form.status" :disabled="!isAdminOrManager">
          <option value="todo">Nowe</option>
          <option value="in-progress">W toku</option>
          <option value="done">Zakończone</option>
        </select>
      </div>
      <div class="form-group">
        <label>Priorytet</label>
        <select v-model="form.priority" :disabled="!isAdminOrManager">
          <option value="low">Niski</option>
          <option value="medium">Średni</option>
          <option value="high">Wysoki</option>
        </select>
      </div>
      <div class="form-group">
        <label>Przypisz do użytkownika (email)</label>
        <select v-model="form.assignedToEmail" :disabled="!isAdminOrManager">
          <option value="">-- Wybierz użytkownika --</option>
          <option v-for="user in users" :key="user._id" :value="user.email">
            {{ user.email }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Przypisz do zespołu (nazwa)</label>
        <select v-model="form.teamId" :disabled="!isAdminOrManager">
          <option value="">-- Wybierz zespół --</option>
          <option v-for="team in teams" :key="team._id" :value="team._id">{{ team.name }}</option>
        </select>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="flex gap-2 mt-3">
        <button class="save-btn" type="submit" :disabled="!isAdminOrManager">Zapisz</button>
        <button class="cancel-btn" type="button" @click="$emit('close')">Anuluj</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
const props = defineProps({ projectId: String, editTask: Object })
const emit = defineEmits(['close', 'saved'])

const users = ref([])
const teams = ref([])
const toast = useToast()
const isAdminOrManager = ref(false)

function checkRole() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    isAdminOrManager.value = payload.role === 'admin' || payload.role === 'manager'
  } catch { /* ignore */ }
}

onMounted(async () => {
  checkRole()
  try {
    const usersRes = await api.get('/users')
    users.value = usersRes.data
  } catch {
    // intentionally ignored
  }
  try {
    const teamsRes = await api.get('/teams')
    teams.value = teamsRes.data
  } catch {
    // intentionally ignored
  }
})

const form = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignedToEmail: '',
  teamId: '',
})
const error = ref('')

watch(
  () => props.editTask,
  (val) => {
    if (val) form.value = { ...val }
    else form.value = { title: '', description: '', status: 'todo', priority: 'medium', assignedToEmail: '', teamId: '' }
    error.value = ''
  },
  { immediate: true },
)

const handleSubmit = async () => {
  error.value = ''
  if (!form.value.title || form.value.title.length < 3) {
    error.value = 'Tytuł zadania musi mieć co najmniej 3 znaki.'
    return
  }
  try {
    // Map assignedToEmail to userId if needed
    let assignedTo = ''
    if (form.value.assignedToEmail) {
      const user = users.value.find(u => u.email === form.value.assignedToEmail)
      assignedTo = user ? user._id : ''
    }
    const payload = {
      ...form.value,
      assignedTo: assignedTo || undefined,
      teamId: form.value.teamId || undefined,
    }
    delete payload.assignedToEmail
    if (!payload.teamId) delete payload.teamId
    if (!payload.assignedTo) delete payload.assignedTo
    if (props.editTask) {
      await api.patch(`/tasks/${props.editTask._id}`, payload)
    } else {
      await api.post('/tasks', payload)
    }
    emit('saved')
  } catch (e) {
    if (e.response && (e.response.status === 403 || e.response.status === 401)) {
      toast.error('Brak uprawnień do wykonania tej akcji!')
    } else {
      error.value = 'Błąd zapisu zadania'
    }
  }
}
</script>

<style scoped>
.task-form-container {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.08);
  padding: 1.2rem 1rem;
  margin-bottom: 1.2rem;
  max-width: 400px;
}
.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
input,
textarea,
select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}
.save-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
.cancel-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
.error {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
