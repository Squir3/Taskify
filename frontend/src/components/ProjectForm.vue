<template>
  <div class="modal-bg">
    <div class="modal-card">
      <h3 class="mb-2">{{ editProject ? 'Edytuj projekt' : 'Dodaj projekt' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Nazwa projektu</label>
          <input v-model="form.name" required :disabled="!isAdminOrManager" />
        </div>
        <div class="form-group">
          <label>Opis</label>
          <textarea v-model="form.description" rows="2" :disabled="!isAdminOrManager"></textarea>
        </div>
        <div class="form-group">
          <label>Członkowie</label>
          <div v-for="(member, idx) in form.members" :key="idx" class="member-row">
            <select v-model="form.members[idx]" :disabled="!isAdminOrManager">
              <option value="">-- Wybierz użytkownika --</option>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.email }}
              </option>
            </select>
            <button v-if="form.members.length > 1 && isAdminOrManager" type="button" class="remove-btn" @click="removeMember(idx)">-</button>
          </div>
          <button v-if="isAdminOrManager" type="button" class="add-btn" @click="addMember">+</button>
        </div>
        <div class="form-group">
          <label>Zespół</label>
          <select v-model="form.teamId" :disabled="!isAdminOrManager">
            <option value="">-- Wybierz zespół --</option>
            <option v-for="team in teams" :key="team._id" :value="team._id">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="flex gap-2 mt-3">
          <button class="save-btn" type="submit" :disabled="!isAdminOrManager">Zapisz</button>
          <button class="cancel-btn" type="button" @click="$emit('close')">Anuluj</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
const props = defineProps({ editProject: Object, users: Array, teams: Array })
const emit = defineEmits(['close', 'saved'])

const form = ref({ name: '', description: '', members: [''], teamId: '' })
const error = ref('')
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

watch(
  () => props.editProject,
  (val) => {
    if (val) form.value = { name: val.name, description: val.description, members: val.members && val.members.length > 0 ? [...val.members] : [''], teamId: val.teamId || '' }
    else form.value = { name: '', description: '', members: [''], teamId: '' }
    error.value = ''
  },
  { immediate: true },
)
function addMember() {
  form.value.members.push('')
}
function removeMember(idx) {
  form.value.members.splice(idx, 1)
}
const handleSubmit = async () => {
  error.value = ''
  if (!form.value.name || form.value.name.length < 3) {
    error.value = 'Nazwa projektu musi mieć co najmniej 3 znaki.'
    return
  }
  // Remove empty selections and duplicates
  const selectedUserIds = form.value.members.filter(Boolean)
  if (new Set(selectedUserIds).size !== selectedUserIds.length) {
    error.value = 'Nie można dodać tego samego użytkownika więcej niż raz.'
    return
  }
  // Validate userIds
  const allExist = selectedUserIds.every((id) => props.users.find((u) => u._id === id))
  if (!allExist) {
    error.value = 'Wybrano nieistniejącego użytkownika.'
    return
  }
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      members: selectedUserIds,
      teamId: form.value.teamId || undefined,
    }
    if (props.editProject) {
      await api.patch(`/projects/${props.editProject._id}`, payload)
    } else {
      await api.post('/projects', payload)
    }
    emit('saved')
  } catch (e) {
    if (e.response && (e.response.status === 403 || e.response.status === 401)) {
      toast.error('Brak uprawnień do wykonania tej akcji!')
    } else {
      error.value = 'Błąd zapisu projektu'
    }
  }
}
checkRole()
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.18);
  padding: 2rem 1.5rem;
  min-width: 320px;
  max-width: 400px;
}
.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
input,
textarea {
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
.member-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.add-btn {
  background: #2980b9;
  color: white;
  border: none;
  padding: 0.2rem 0.7rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.5rem;
}
.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.2rem 0.7rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.5rem;
}
</style>
