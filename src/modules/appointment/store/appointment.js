import { defineStore } from 'pinia'
import { useDataStore } from '@/modules/data/store/data'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
  }),

  getters: {
    // Delegado ao dataStore (fonte centralizada)
    agendamentos: () => useDataStore().appointments,

    // Retorna todos os agendamentos com status 'Confirmado' (usados no calendário)
    agendamentosConfirmados: () => {
      return useDataStore().appointments.filter((a) => a.status === 'Confirmado')
    },

    // Retorna agendamentos confirmados para uma data específica (YYYY-MM-DD)
    confirmadosPorData: () => (dataStr) => {
      return useDataStore().appointments.filter(
        (a) => a.status === 'Confirmado' && a.data === dataStr
      )
    },

    // Retorna agendamentos de um aluno específico pelo email (legado)
    agendamentosPorAluno: () => (email) => {
      return useDataStore().appointments.filter((a) => a.alunoEmail === email)
    },

    // Visibilidade por função (lista unificada):
    // aluno -> created_by == id OU aluno_matricula == matricula OU alunoEmail == email
    // coordenador -> coordinator_id == id (só destinados, nunca todos)
    // suporte -> created_by == id (só próprios)
    visiveisPorFuncao: () => (user) => {
      if (!user) return []
      const agendamentos = useDataStore().appointments
      if (user.tipo === 'aluno') {
        return agendamentos.filter(
          (a) =>
            a.created_by === user.id ||
            (user.matricula && a.aluno_matricula === user.matricula) ||
            a.alunoEmail === user.email
        )
      }
      if (user.tipo === 'coordenador') {
        return agendamentos.filter((a) => a.coordinator_id === user.id)
      }
      if (user.tipo === 'suporte') {
        return agendamentos.filter((a) => a.created_by === user.id)
      }
      return []
    },

    // Contadores gerais
    totalAgendamentos: () => useDataStore().appointments.length,
    totalPendentes: () => useDataStore().appointments.filter((a) => a.status === 'Pendente').length,
    totalConfirmados: () => useDataStore().appointments.filter((a) => a.status === 'Confirmado').length
  },

  actions: {
    /**
     * Valida um agendamento, mudando seu status para 'Confirmado'.
     * Isso faz o agendamento aparecer imediatamente no Calendário de Atendimento.
     */
    validarAgendamento(id) {
      useDataStore().validarAgendamento(id)
    },

    /**
     * Cancela um agendamento.
     */
    cancelarAgendamento(id) {
      useDataStore().cancelarAgendamento(id)
    },

    /**
     * Adiciona um novo agendamento.
     * Preenche created_by / aluno_matricula / coordinator_id quando não informados.
     */
    criarAgendamento(novoAgendamento, criador = null) {
      return useDataStore().criarAgendamento(novoAgendamento, criador)
    }
  }
})

// Alias para compatibilidade com código antigo (stores/agendamentos.js)
export const useAgendamentosStore = useAppointmentStore
