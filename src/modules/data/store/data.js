import { defineStore } from 'pinia'

const STORAGE_KEY = 'agendamento_data_v1'
const STORAGE_VERSION = 1

const MOCK_USERS = [
  { id: 1, nome: 'Maria Silva', email: 'aluno@teste.com', senha: '123456', tipo: 'aluno', matricula: '2026001' },
  { id: 2, nome: 'João Santos', email: 'coord@teste.com', senha: '123456', tipo: 'coordenador', matricula: 'C001', carga_horaria_semanal: 20 },
  { id: 3, nome: 'Suporte Silva', email: 'suporte@teste.com', senha: '123456', tipo: 'suporte', matricula: 'S001' }
]

const MOCK_APPOINTMENTS = [
  {
    id: 1, aluno: 'Maria Silva', alunoEmail: 'aluno@teste.com', aluno_matricula: '2026001',
    created_by: 1, coordinator_id: 2, nome: 'Consulta Psicológica', data: '2026-10-15',
    horario: '14:00', local: 'Sala 201', status: 'Confirmado',
    descricao: 'Sessão de acompanhamento psicológico individual.'
  },
  {
    id: 2, aluno: 'Carlos Souza', alunoEmail: 'carlos@teste.com', aluno_matricula: '2026002',
    created_by: 3, coordinator_id: 2, nome: 'Orientação Acadêmica', data: '2026-10-18',
    horario: '10:30', local: 'Sala 105', status: 'Confirmado',
    descricao: 'Orientação sobre grade curricular e equivalência de matérias.'
  },
  {
    id: 3, aluno: 'Ana Lima', alunoEmail: 'ana@teste.com', aluno_matricula: '2026003',
    created_by: 3, coordinator_id: 2, nome: 'Atendimento Social', data: '2026-10-20',
    horario: '09:00', local: 'Sala 302', status: 'Pendente',
    descricao: 'Avaliação socioeconômica para auxílio permanência.'
  },
  {
    id: 4, aluno: 'Pedro Costa', alunoEmail: 'pedro@teste.com', aluno_matricula: '2026004',
    created_by: 1, coordinator_id: 2, nome: 'Consulta Nutricional', data: '2026-10-22',
    horario: '11:00', local: 'Sala 108', status: 'Pendente',
    descricao: 'Acompanhamento nutricional e reeducação alimentar.'
  },
  {
    id: 5, aluno: 'Maria Silva', alunoEmail: 'aluno@teste.com', aluno_matricula: '2026001',
    created_by: 1, coordinator_id: 2, nome: 'Orientação Acadêmica', data: '2026-10-25',
    horario: '15:00', local: 'Coordenação Geral', status: 'Confirmado',
    descricao: 'Reunião de alinhamento sobre TCC e estágio supervisionado.'
  },
  {
    id: 6, aluno: 'Lucas Ferreira', alunoEmail: 'lucas@teste.com', aluno_matricula: '2026005',
    created_by: 3, coordinator_id: 2, nome: 'Apoio Psicopedagógico', data: '2026-10-15',
    horario: '16:00', local: 'Sala 201', status: 'Confirmado',
    descricao: 'Avaliação de métodos de estudo e rendimento acadêmico.'
  },
  {
    id: 7, aluno: 'Maria Silva', alunoEmail: 'aluno@teste.com', aluno_matricula: '2026001',
    created_by: 1, coordinator_id: 2, nome: 'Consulta Nutricional', data: '2026-09-10',
    horario: '11:00', local: 'Sala 108', status: 'Cancelado',
    descricao: 'Acompanhamento de rotina nutricional.'
  }
]

function dadosValidos(dados) {
  if (!dados || typeof dados !== 'object') return false
  if (dados.version !== STORAGE_VERSION) return false
  if (!Array.isArray(dados.users)) return false
  if (!Array.isArray(dados.appointments)) return false
  return true
}

function carregarDoStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const dados = JSON.parse(raw)
    if (!dadosValidos(dados)) {
      console.warn('Dados do localStorage incompatíveis ou corrompidos. Ignorando e usando mocks.')
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return { users: dados.users, appointments: dados.appointments }
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
    return null
  }
}

function persistirNoStorage(users, appointments) {
  try {
    const payload = { version: STORAGE_VERSION, users, appointments }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('Erro ao persistir dados no localStorage:', error)
  }
}

function proximoIdUsuario(users) {
  if (!users || users.length === 0) return 1
  return Math.max(...users.map((u) => u.id || 0)) + 1
}

function proximoIdAgendamento(appointments) {
  if (!appointments || appointments.length === 0) return 1
  return Math.max(...appointments.map((a) => a.id || 0)) + 1
}

/**
 * Converte uma string de data no formato 'YYYY-MM-DD' para um objeto Date
 * considerando apenas ano, mês e dia, evitando problemas de fuso horário.
 * A partir do ano/mês/dia, cria uma Date em meia-noite local (sem conversão de fuso).
 */
function parseDateLocal(dateStr) {
  if (!dateStr) return null
  const partes = String(dateStr).split('-')
  if (partes.length !== 3) return null
  const [ano, mes, dia] = partes.map(Number)
  if (!ano || !mes || !dia) return null
  // Cria Date usando componentes individuais: isso interpreta como horário local,
  // evitando conversões de fuso que poderiam alterar o dia.
  return new Date(ano, mes - 1, dia)
}

/**
 * Retorna a data local de hoje (apenas ano, mês, dia) como um objeto Date
 * definido em meia-noite local, sem componente de horário.
 */
function hojeLocal() {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

/**
 * Verifica se uma data no formato 'YYYY-MM-DD' é estritamente anterior a hoje.
 * - Retorna true se a data for menor que hoje (ontem ou anterior).
 * - Retorna false se a data for hoje ou futura.
 * - Considera apenas ano, mês e dia (ignora horário).
 * - Trata strings inválidas como não-passadas (retorna false).
 */
function isDateBeforeToday(dateStr) {
  const dataAgendamento = parseDateLocal(dateStr)
  if (!dataAgendamento) return false
  const hoje = hojeLocal()
  // Comparação por timestamp em meia-noite local: apenas ano/mês/dia importa.
  return dataAgendamento.getTime() < hoje.getTime()
}

/**
 * Retorna true se a data é hoje ou futura (deve ser exibida).
 */
function isDateTodayOrFuture(dateStr) {
  return !isDateBeforeToday(dateStr)
}

/**
 * Filtra uma lista de agendamentos, retornando apenas aqueles com data
 * igual a hoje ou futura. Os dados originais são preservados.
 */
function filtrarAgendamentosFuturosOuHoje(appointments) {
  if (!Array.isArray(appointments)) return []
  return appointments.filter((a) => isDateTodayOrFuture(a.data))
}

export const useDataStore = defineStore('data', {
  state: () => ({
    users: [],
    appointments: [],
    initialized: false,
    error: null
  }),

  getters: {
    proximoIdUser: (state) => proximoIdUsuario(state.users),
    proximoIdAppointment: (state) => proximoIdAgendamento(state.appointments),
    totalUsers: (state) => state.users.length,
    totalAppointments: (state) => state.appointments.length,
    appointmentsByStatus: (state) => (status) =>
      state.appointments.filter((a) => a.status === status),
    userByEmail: (state) => (email) =>
      state.users.find((u) => u.email === email),
    userById: (state) => (id) =>
      state.users.find((u) => u.id === id),

    // Funções utilitárias de comparação de datas (acessíveis via useDataStore())
    isDateBeforeToday: () => isDateBeforeToday,
    isDateTodayOrFuture: () => isDateTodayOrFuture,
    filtrarAgendamentosFuturosOuHoje: () => filtrarAgendamentosFuturosOuHoje
  },

  actions: {
    async initialize() {
      if (this.initialized) return
      try {
        const locais = carregarDoStorage()
        if (locais) {
          this.users = locais.users
          this.appointments = locais.appointments
        } else {
          this.users = JSON.parse(JSON.stringify(MOCK_USERS))
          this.appointments = JSON.parse(JSON.stringify(MOCK_APPOINTMENTS))
          persistirNoStorage(this.users, this.appointments)
        }
        this.initialized = true
        this.error = null
      } catch (error) {
        console.error('Erro ao inicializar store de dados:', error)
        this.error = error.message
        this.users = JSON.parse(JSON.stringify(MOCK_USERS))
        this.appointments = JSON.parse(JSON.stringify(MOCK_APPOINTMENTS))
        this.initialized = true
      }
    },

    async reloadFromStorage() {
      const locais = carregarDoStorage()
      if (locais) {
        this.users = locais.users
        this.appointments = locais.appointments
      }
      this.initialized = true
      this.error = null
    },

    async save() {
      persistirNoStorage(this.users, this.appointments)
    },

    criarUsuario(usuario) {
      if (!usuario || !usuario.nome || !usuario.email || !usuario.senha || !usuario.tipo) {
        throw new Error('Nome, e-mail, senha e tipo são obrigatórios.')
      }
      if (this.users.some((u) => u.email === usuario.email)) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.')
      }
      const novoUsuario = {
        id: proximoIdUsuario(this.users),
        nome: usuario.nome.trim(),
        email: usuario.email.trim().toLowerCase(),
        senha: usuario.senha,
        tipo: usuario.tipo,
        matricula: usuario.matricula || null,
        carga_horaria_semanal: usuario.carga_horaria_semanal || null
      }
      this.users.push(novoUsuario)
      this.save()
      return novoUsuario
    },

    criarAgendamento(agendamento, criador = null) {
      if (!agendamento) {
        throw new Error('Dados do agendamento são obrigatórios.')
      }
      if (!agendamento.nome) {
        throw new Error('Tipo de atendimento é obrigatório.')
      }
      if (!agendamento.data) {
        throw new Error('Data é obrigatória.')
      }
      if (!agendamento.horario) {
        throw new Error('Horário é obrigatório.')
      }
      if (criador && !this.users.some((u) => u.id === criador.id)) {
        throw new Error('Usuário criador não encontrado.')
      }
      const novoAgendamento = {
        id: proximoIdAgendamento(this.appointments),
        status: 'Pendente',
        created_by: criador?.id ?? agendamento.created_by ?? null,
        aluno: agendamento.aluno || (criador?.nome || 'Aluno'),
        alunoEmail: agendamento.alunoEmail || (criador?.email || ''),
        aluno_matricula: agendamento.aluno_matricula ?? criador?.matricula ?? null,
        coordinator_id: agendamento.coordinator_id ?? 2,
        nome: agendamento.nome,
        data: agendamento.data,
        horario: agendamento.horario,
        local: agendamento.local || 'A definir',
        descricao: agendamento.descricao || ''
      }
      this.appointments.push(novoAgendamento)
      this.save()
      return novoAgendamento
    },

    validarAgendamento(id) {
      const item = this.appointments.find((a) => a.id === id)
      if (item) {
        item.status = 'Confirmado'
        this.save()
      }
    },

    cancelarAgendamento(id) {
      const item = this.appointments.find((a) => a.id === id)
      if (item) {
        item.status = 'Cancelado'
        this.save()
      }
    },

    removerUsuario(id) {
      const index = this.users.findIndex((u) => u.id === id)
      if (index !== -1) {
        this.users.splice(index, 1)
        this.save()
      }
    }
  }
})

export const useDataStoreAlias = useDataStore