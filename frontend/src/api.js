import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // Adres backendu
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor dołączający token JWT do każdego żądania
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor obsługujący błąd 401 globalnie
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      // Wymusza odświeżenie stanu isLoggedIn w NavBar
      window.dispatchEvent(new Event('storage'))
      // Przekierowanie na /auth jeśli nie jesteśmy już na stronie logowania
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth?mode=login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
