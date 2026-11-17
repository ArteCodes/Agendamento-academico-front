import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição: injeta o ID Token do Firebase no header Authorization
api.interceptors.request.use(
  async (config) => {
    try {
      // Garante que o Firebase terminou de restaurar a sessão persistida
      // (importante após recarregar a página).
      await auth.authStateReady()
      const user = auth.currentUser
      if (user) {
        const idToken = await user.getIdToken()
        config.headers.Authorization = `Bearer ${idToken}`
      }
    } catch (error) {
      console.error('Erro ao obter ID Token do Firebase:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de resposta: opcional para tratar erros de autenticação globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Token inválido ou expirado. Faça login novamente.')
    }
    return Promise.reject(error)
  }
)

export default api