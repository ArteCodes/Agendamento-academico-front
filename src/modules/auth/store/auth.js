import { defineStore } from 'pinia'
import { useDataStore } from '@/modules/data/store/data'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Objeto do usuário autenticado: null ou { id, nome, email, tipo }
    user: null
  }),

  getters: {
    // Retorna true se o usuário estiver autenticado (diferente de null)
    isAuthenticated: (state) => state.user !== null,

    // Retorna true se o usuário for do tipo 'aluno'
    isAluno: (state) => state.user?.tipo === 'aluno',

    // Retorna true se o usuário for do tipo 'coordenador'
    isCoordenador: (state) => state.user?.tipo === 'coordenador',

    // Retorna true se o usuário for do tipo 'suporte'
    isSuporte: (state) => state.user?.tipo === 'suporte',

    // Pode criar agendamentos: aluno ou suporte (coordenador não cria)
    canCreate: (state) => state.user?.tipo === 'aluno' || state.user?.tipo === 'suporte',

    // Pode validar agendamentos: coordenador ou suporte (validação só no Show)
    canValidate: (state) => state.user?.tipo === 'coordenador' || state.user?.tipo === 'suporte',

    // Retorna o tipo do usuário ('aluno', 'coordenador') ou null se não logado
    userTipo: (state) => (state.user ? state.user.tipo : null),

    // Retorna o nome do usuário autenticado ou string vazia
    userName: (state) => (state.user ? state.user.nome : ''),

    // Carga horária semanal do coordenador (fixa, vinda da tabela de coordenadores — não editável na tela).
    // Fallback 20h para coordenador com sessão antiga sem o campo.
    cargaHorariaSemanal: (state) => {
      if (state.user?.carga_horaria_semanal != null) return Number(state.user.carga_horaria_semanal)
      if (state.user?.tipo === 'coordenador') return 20
      return 0
    },

    // Lista de todos os usuários cadastrados (fonte: dataStore)
    allUsers: (state) => {
      const dataStore = useDataStore()
      return dataStore.users
    }
  },

  actions: {
    /**
     * Valida credenciais contra os usuários cadastrados no dataStore.
     * Atualiza o estado, persiste no localStorage e retorna true/false.
     */
    login(email, senha) {
      const dataStore = useDataStore()
      const foundUser = dataStore.users.find(
        (u) => u.email === email && u.senha === senha
      )

      if (foundUser) {
        // Armazena dados do usuário sem expor a senha no estado
        const { senha: _, ...userData } = foundUser
        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      }

      return false
    },

    /**
     * Cadastra um novo usuário no sistema.
     * Delegado ao dataStore (fonte centralizada).
     */
    criarUsuario(usuario) {
      const dataStore = useDataStore()
      return dataStore.criarUsuario(usuario)
    },

    /**
     * Limpa o estado do usuário e remove os dados do localStorage.
     */
    logout() {
      this.user = null
      localStorage.removeItem('user')
    },

    /**
     * Tenta carregar o usuário salvo no localStorage na inicialização da aplicação.
     */
    loadFromStorage() {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          this.user = JSON.parse(storedUser)
          return true
        }
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário do localStorage:', error)
        this.user = null
        localStorage.removeItem('user')
      }
      return false
    }
  }
})
