import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'
import api from '@/services/api'

/**
 * Normaliza o tipo do usuário para o padrão interno do frontend:
 * 'aluno' | 'coordenador' | 'suporte'.
 *
 * O backend devolve `tipo` em minúsculas, mas sessões antigas podem ter
 * apenas `perfil` ('Aluno', 'Coordenador', 'Apoio').
 */
function normalizarTipo(valor) {
  const bruto = String(valor || '').trim().toLowerCase()
  if (bruto === 'apoio' || bruto === 'nao_aluno' || bruto === 'não aluno') return 'suporte'
  return bruto
}

function normalizarUsuario(usuario) {
  if (!usuario) return null
  return {
    ...usuario,
    tipo: normalizarTipo(usuario.tipo || usuario.perfil),
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Objeto do usuário autenticado (vindo do backend /api/auth/me)
    user: null,
    // ID Token do Firebase
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,

    isAluno: (state) => state.user?.tipo === 'aluno',

    isCoordenador: (state) => state.user?.tipo === 'coordenador',

    isSuporte: (state) => state.user?.tipo === 'suporte',

    canCreate: (state) => state.user?.tipo === 'aluno' || state.user?.tipo === 'suporte',

    canValidate: (state) => state.user?.tipo === 'coordenador' || state.user?.tipo === 'suporte',

    userTipo: (state) => (state.user ? state.user.tipo : null),

    userName: (state) => (state.user ? state.user.nome : ''),

    userMatricula: (state) => (state.user ? state.user.matricula : null),

    cargaHorariaSemanal: (state) => {
      if (state.user?.carga_horaria_semanal != null) return Number(state.user.carga_horaria_semanal)
      if (state.user?.tipo === 'coordenador') return 20
      return 0
    },
  },

  actions: {
    /**
     * Login com suporte a múltiplos identificadores (E-mail, CPF ou Matrícula).
     *
     * Fluxo:
     * 1. Se o identificador não for um e-mail, consulta o backend
     *    (POST /api/auth/resolve-identifier) para descobrir o e-mail cadastrado.
     * 2. Autentica no Firebase com signInWithEmailAndPassword.
     * 3. Chama GET /api/auth/me para recuperar o perfil real do backend.
     * 4. Salva o perfil normalizado e o token no estado e localStorage.
     */
    async login(identificador, senha) {
      try {
        let email = (identificador || '').trim()

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

        if (!isEmail) {
          const response = await api.post('/auth/resolve-identifier', {
            identificador: email,
          })
          if (!response.data?.encontrado || !response.data?.email) {
            return false
          }
          email = response.data.email
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, senha)
        const firebaseUser = userCredential.user

        const idToken = await firebaseUser.getIdToken()

        const response = await api.get('/auth/me')
        const usuario = normalizarUsuario(response.data)

        this.user = usuario
        this.token = idToken

        localStorage.setItem('auth', JSON.stringify({ user: usuario, token: idToken }))

        return true
      } catch (error) {
        console.error('Erro no login:', error)
        return false
      }
    },

    /**
     * Logout: limpa estado, localStorage e sessão do Firebase.
     */
    async logout() {
      try {
        await signOut(auth)
      } catch (error) {
        console.error('Erro ao fazer logout no Firebase:', error)
      }

      this.user = null
      this.token = null
      localStorage.removeItem('auth')
    },

    /**
     * Carrega a sessão salva no localStorage na inicialização da aplicação.
     * Reaplica a normalização para sessões criadas por versões antigas.
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem('auth')
        if (stored) {
          const { user, token } = JSON.parse(stored)
          if (user && token) {
            this.user = normalizarUsuario(user)
            this.token = token
            return true
          }
        }
      } catch (error) {
        console.error('Erro ao recuperar sessão do localStorage:', error)
        this.user = null
        this.token = null
        localStorage.removeItem('auth')
      }
      return false
    },
  },
})
