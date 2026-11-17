import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    agendamentos: [],
    carregando: false,
    erro: null,
  }),

  getters: {
    // Retorna todos os agendamentos com status 'Confirmado' (usados no calendário)
    agendamentosConfirmados: (state) => {
      return state.agendamentos.filter((a) => a.status === 'Confirmado')
    },

    // Retorna agendamentos confirmados para uma data específica (YYYY-MM-DD)
    confirmadosPorData: (state) => (dataStr) => {
      return state.agendamentos.filter(
        (a) => a.status === 'Confirmado' && a.data === dataStr
      )
    },

    // Retorna agendamentos de um aluno específico pelo email (legado)
    agendamentosPorAluno: (state) => (email) => {
      return state.agendamentos.filter((a) => a.alunoEmail === email)
    },

    // Visibilidade por função (lista unificada):
    // aluno -> created_by == id OU aluno_matricula == matricula OU alunoEmail == email
    // coordenador -> coordinator_id == id (só destinados, nunca todos)
    // suporte -> created_by == id (só próprios)
    visiveisPorFuncao: (state) => (user) => {
      if (!user) return []
      const tipo = String(user.tipo || user.perfil || '').trim().toLowerCase()
      const email = String(user.email || '').toLowerCase()
      if (tipo === 'aluno') {
        return state.agendamentos.filter(
          (a) =>
            a.created_by === user.id ||
            (user.matricula && a.aluno_matricula === user.matricula) ||
            String(a.alunoEmail || '').toLowerCase() === email
        )
      }
      if (tipo === 'coordenador') {
        return state.agendamentos.filter((a) => a.coordinator_id === user.id)
      }
      if (tipo === 'suporte' || tipo === 'apoio') {
        return state.agendamentos.filter((a) => a.created_by === user.id)
      }
      return []
    },

    // Contadores gerais
    totalAgendamentos: (state) => state.agendamentos.length,
    totalPendentes: (state) => state.agendamentos.filter((a) => a.status === 'Pendente').length,
    totalConfirmados: (state) => state.agendamentos.filter((a) => a.status === 'Confirmado').length,
  },

  actions: {
    /**
     * Busca os agendamentos do backend filtrados pelo perfil do usuário logado.
     */
    async listar() {
      this.carregando = true
      this.erro = null
      try {
        const response = await api.get('/agendamentos')
        this.agendamentos = response.data || []
        return this.agendamentos
      } catch (error) {
        this.erro = error
        console.error('Erro ao listar agendamentos:', error)
        throw error
      } finally {
        this.carregando = false
      }
    },

    /**
     * Cria um novo agendamento via POST /api/agendamentos.
     */
    async criarAgendamento(novoAgendamento) {
      try {
        const response = await api.post('/agendamentos', novoAgendamento)
        const criado = response.data
        this.agendamentos.push(criado)
        return criado
      } catch (error) {
        this.erro = error
        console.error('Erro ao criar agendamento:', error)
        throw error
      }
    },

    /**
     * Cancela um agendamento via PATCH /api/agendamentos/{id}.
     */
    async cancelarAgendamento(id) {
      try {
        const response = await api.patch(`/agendamentos/${id}`)
        const atualizado = response.data
        const index = this.agendamentos.findIndex((a) => a.id === id)
        if (index !== -1) {
          this.agendamentos[index] = atualizado
        }
        return atualizado
      } catch (error) {
        this.erro = error
        console.error('Erro ao cancelar agendamento:', error)
        throw error
      }
    },

    /**
     * Valida (confirma) um agendamento via PATCH /api/agendamentos/{id}/validar.
     */
    async validarAgendamento(id) {
      try {
        const response = await api.patch(`/agendamentos/${id}/validar`)
        const atualizado = response.data
        const index = this.agendamentos.findIndex((a) => a.id === id)
        if (index !== -1) {
          this.agendamentos[index] = atualizado
        }
        return atualizado
      } catch (error) {
        this.erro = error
        console.error('Erro ao validar agendamento:', error)
        throw error
      }
    },

    /**
     * Limpa a lista local (útil para logout ou reset).
     */
    limpar() {
      this.agendamentos = []
      this.erro = null
    },
  },
})

// Alias para compatibilidade com código antigo (stores/agendamentos.js)
export const useAgendamentosStore = useAppointmentStore