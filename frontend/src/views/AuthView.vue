<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 v-if="mode === 'login'">Logowanie</h2>
      <h2 v-else>Rejestracja</h2>
      <form @submit.prevent="mode === 'login' ? handleLogin() : handleRegister()">
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Hasło</label>
          <input v-model="form.password" type="password" required minlength="6" />
        </div>
        <div v-if="mode === 'register'" class="form-group">
          <label>Powtórz hasło</label>
          <input v-model="form.repeatPassword" type="password" required minlength="6" />
        </div>
        <button class="auth-btn" type="submit">{{ mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się' }}</button>
      </form>
      <div class="auth-switch">
        <span v-if="mode === 'login'">Nie masz konta?
          <a href="#" @click.prevent="switchMode('register')">Zarejestruj się</a>
        </span>
        <span v-else>Masz już konto?
          <a href="#" @click.prevent="switchMode('login')">Zaloguj się</a>
        </span>
      </div>
      <div v-if="error" class="auth-error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const error = ref('')
const form = ref({
  email: '',
  password: '',
  repeatPassword: '',
})
const mode = ref(route.query.mode === 'register' ? 'register' : 'login')

const switchMode = (newMode) => {
  error.value = ''
  form.value = { email: '', password: '', repeatPassword: '' }
  mode.value = newMode
  router.replace({ path: '/auth', query: { mode: newMode } })
}

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode === 'register' || newMode === 'login') {
      mode.value = newMode
      error.value = ''
      form.value = { email: '', password: '', repeatPassword: '' }
    }
  }
)

onMounted(() => {
  if (route.query.mode === 'register') mode.value = 'register'
  else mode.value = 'login'
})

const handleLogin = async () => {
  error.value = ''
  if (!form.value.email || !form.value.email.includes('@')) {
    error.value = 'Podaj poprawny adres email.'
    return
  }
  try {
    const res = await api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password,
    })
    localStorage.setItem('token', res.data.access_token)
    toast.success('Zalogowano pomyślnie!')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Błąd logowania'
  }
}

const handleRegister = async () => {
  error.value = ''
  if (!form.value.email || !form.value.email.includes('@')) {
    error.value = 'Podaj poprawny adres email.'
    return
  }
  if (form.value.password !== form.value.repeatPassword) {
    error.value = 'Hasła nie są zgodne.'
    return
  }
  try {
    await api.post('/auth/register', {
      email: form.value.email,
      password: form.value.password,
    })
    toast.success('Rejestracja zakończona sukcesem!')
    switchMode('login')
  } catch (e) {
    error.value = e.response?.data?.message || 'Błąd rejestracji'
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6fa;
}
.auth-card {
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(44, 62, 80, 0.08);
  min-width: 320px;
  max-width: 350px;
  width: 100%;
}
.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #2c3e50;
}
input, select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}
.auth-btn {
  width: 100%;
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.auth-btn:hover {
  background: #1a232e;
}
.auth-switch {
  margin-top: 1.2rem;
  text-align: center;
  font-size: 0.97rem;
}
.auth-switch a {
  color: #2c3e50;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}
.auth-error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
}
@media (max-width: 500px) {
  .auth-card {
    padding: 1.2rem 0.5rem;
    min-width: 90vw;
    max-width: 98vw;
  }
}
</style>
