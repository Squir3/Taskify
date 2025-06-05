<template>
  <div class="modal-bg">
    <div class="modal-card">
      <h3 class="mb-2">{{ editUser ? 'Edytuj użytkownika' : 'Dodaj użytkownika' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required :disabled="!isAdmin" />
        </div>
        <div class="form-group">
          <label>Rola</label>
          <select v-model="form.role" :disabled="!isAdmin">
            <option value="user">Użytkownik</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="flex gap-2 mt-3">
          <button class="save-btn" type="submit" :disabled="!isAdmin">Zapisz</button>
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
const props = defineProps({ editUser: Object })
const emit = defineEmits(['close', 'saved'])

const form = ref({ email: '', role: 'user' })
const error = ref('')
const toast = useToast()
const isAdmin = ref(false)

function checkRole() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    isAdmin.value = payload.role === 'admin'
  } catch { /* ignore */ }
}

watch(() => props.editUser, (val) => {
  if (val) form.value = { email: val.email, role: val.role }
  else form.value = { email: '', role: 'user' }
  error.value = ''
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  if (!form.value.email || form.value.email.length < 3) {
    error.value = 'Podaj poprawny email.'
    return
  }
  try {
    if (props.editUser) {
      await api.patch(`/users/${props.editUser._id}`, { email: form.value.email, role: form.value.role })
    } else {
      await api.post('/users', { email: form.value.email, role: form.value.role })
    }
    emit('saved')
  } catch (e) {
    if (e.response && (e.response.status === 403 || e.response.status === 401)) {
      toast.error('Brak uprawnień do wykonania tej akcji!')
    } else {
      error.value = 'Błąd zapisu użytkownika'
    }
  }
}
checkRole()
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44,62,80,0.18);
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
input, select {
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
