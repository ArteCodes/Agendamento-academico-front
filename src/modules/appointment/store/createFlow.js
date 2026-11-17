import { defineStore } from 'pinia'
import api from '@/services/api'

/**
 * createFlow.js — estado do novo fluxo de agendamento (5 telas).
 *
 * Guarda:
 * - lista de coordenadores (com cargo e foto);
 * - coordenador selecionado;
 * - dias/horários e slot selecionado;
 * - bloqueio temporário (token + expiração);
 * - dados do formulário.
 *
 * O bloqueio é sempre criado/liberado no backend. Este store apenas mantém o
 * token e garante a liberação ao sair do fluxo.
 */
export const useCreateFlowStore = defineStore('createFlow', {
  state: () => ({
    coordenadores: [],
    carregandoCoordenadores: false,
    erroCoordenadores: null,

    coordenador: null,

    dias: [],
    diaSelecionado: null,
    slot: null,
    bloqueio: null,
    ttlMin: 10,
    carregandoHorarios: false,
    erroHorarios: null,
    bloqueando: false,

    perfil: null,
    carregandoPerfil: false,
    erroPerfil: null,

    formulario: null,
    salvando: false,
    erro: null,
  }),

  getters: {
    temCoordenador: (state) => Boolean(state.coordenador),
    temBloqueio: (state) => Boolean(state.bloqueio?.token),
    diaAtual: (state) =>
      state.dias.find((dia) => dia.data === state.diaSelecionado) || null,
  },

  actions: {
    /**
     * Busca os coordenadores reais (com cargo e foto) no backend.
     */
    async carregarCoordenadores(forcar = false) {
      if (this.carregandoCoordenadores) return this.coordenadores
      if (this.coordenadores.length > 0 && !forcar) return this.coordenadores

      this.carregandoCoordenadores = true
      this.erroCoordenadores = null
      try {
        const resposta = await api.get('/agendamento-fluxo/coordenadores')
        this.coordenadores = resposta.data || []
        return this.coordenadores
      } catch (erro) {
        this.erroCoordenadores =
          'Não foi possível carregar os coordenadores. Tente novamente.'
        console.error('Erro ao carregar coordenadores:', erro)
        throw erro
      } finally {
        this.carregandoCoordenadores = false
      }
    },

    /**
     * Busca o perfil do agendante para preencher o formulário.
     * Aluno: nome/matrícula/curso/período/turma vêm preenchidos e ficam travados;
     * telefone/e-mail vêm preenchidos e continuam editáveis.
     */
    async carregarPerfilAgendante(forcar = false) {
      if (this.carregandoPerfil) return this.perfil
      if (this.perfil && !forcar) return this.perfil

      this.carregandoPerfil = true
      this.erroPerfil = null
      try {
        const resposta = await api.get('/agendamento-fluxo/perfil-agendante')
        this.perfil = resposta.data || null
        return this.perfil
      } catch (erro) {
        this.erroPerfil =
          'Não foi possível carregar seus dados. Recarregue a página e tente novamente.'
        console.error('Erro ao carregar perfil do agendante:', erro)
        throw erro
      } finally {
        this.carregandoPerfil = false
      }
    },

    /**
     * Guarda os oito campos preenchidos na Tela de Formulário.
     */
    salvarFormulario(dados) {
      this.formulario = { ...dados }
      return this.formulario
    },

    /**
     * Converte o bloqueio temporário em agendamento definitivo.
     *
     * É a única chamada que grava o agendamento: só ocorre ao clicar em
     * "Solicitar agendamento" na Tela de Resumo. Após o sucesso o bloqueio é
     * removido do estado SEM chamar o DELETE, pois o servidor já o consumiu.
     */
    async confirmarAgendamento() {
      if (!this.bloqueio?.token) {
        throw new Error('Bloqueio inexistente.')
      }

      this.salvando = true
      this.erro = null
      try {
        const resposta = await api.post('/agendamento-fluxo/confirmar', {
          token: this.bloqueio.token,
          ...(this.formulario || {}),
        })

        this.bloqueio = null
        this.slot = null
        return resposta.data
      } finally {
        this.salvando = false
      }
    },

    /**
     * Seleciona o coordenador do fluxo. Ao trocar de coordenador, libera o
     * bloqueio anterior (se existir) e limpa o horário selecionado.
     */
    async selecionarCoordenador(coordenador) {
      const mudou = this.coordenador?.id !== coordenador?.id

      if (mudou) {
        await this.liberarBloqueio()
        this.limparHorario()
        this.coordenador = coordenador
      }

      return this.coordenador
    },

    /**
     * Limpa o estado de horários sem chamar o backend.
     */
    limparHorario() {
      this.dias = []
      this.diaSelecionado = null
      this.slot = null
      this.bloqueio = null
      this.erroHorarios = null
    },

    /**
     * Busca os horários concretos dos próximos dias para o coordenador escolhido.
     */
    async carregarHorarios() {
      if (!this.coordenador?.id) return []

      this.carregandoHorarios = true
      this.erroHorarios = null
      try {
        const resposta = await api.get('/agendamento-fluxo/horarios', {
          params: { coordinator_id: this.coordenador.id, dias: 7 },
        })

        this.dias = resposta.data?.dias || []
        this.ttlMin = resposta.data?.ttl_min ?? this.ttlMin
        this.descartarBloqueioExpirado()
        this.sincronizarSelecao()
        return this.dias
      } catch (erro) {
        this.erroHorarios = 'Não foi possível carregar os horários. Tente novamente.'
        console.error('Erro ao carregar horários:', erro)
        throw erro
      } finally {
        this.carregandoHorarios = false
      }
    },

    /**
     * Garante um dia selecionado: mantém o atual se ainda existir; senão usa o
     * primeiro dia com horários (ou o primeiro dia).
     */
    sincronizarSelecao() {
      if (
        this.diaSelecionado &&
        this.dias.some((dia) => dia.data === this.diaSelecionado)
      ) {
        return
      }

      const comHorarios = this.dias.find((dia) => dia.slots.length > 0)
      this.diaSelecionado = (comHorarios || this.dias[0])?.data || null
    },

    selecionarDia(data) {
      if (this.dias.some((dia) => dia.data === data)) {
        this.diaSelecionado = data
      }
    },

    marcarSlotStatus(dia, horario, status) {
      const diaAlvo = this.dias.find((item) => item.data === dia)
      const slotAlvo = diaAlvo?.slots.find((item) => item.horario === horario)
      if (slotAlvo) slotAlvo.status = status
    },

    /**
     * Descarta o bloqueio local se o TTL já venceu.
     */
    descartarBloqueioExpirado() {
      const expiraEm = this.bloqueio?.expiraEm
      if (!expiraEm || Date.parse(expiraEm) > Date.now()) return false

      const dia = this.diaSelecionado
      const horario = this.slot?.horario

      this.bloqueio = null
      this.slot = null
      if (horario) this.marcarSlotStatus(dia, horario, 'livre')

      return true
    },

    /**
     * Cria o bloqueio temporário de um horário livre.
     * Ao trocar de horário, libera o bloqueio anterior antes.
     */
    async bloquearHorario(dia, slot) {
      if (!this.coordenador?.id) return null

      this.bloqueando = true
      try {
        const trocando =
          this.bloqueio?.token &&
          (this.diaSelecionado !== dia || this.slot?.horario !== slot.horario)

        if (trocando) await this.liberarBloqueio()

        const resposta = await api.post('/agendamento-fluxo/bloqueios', {
          coordinator_id: this.coordenador.id,
          data: dia,
          horario: slot.horario,
        })

        this.bloqueio = {
          token: resposta.data.token,
          expiraEm: resposta.data.expira_em,
        }
        this.ttlMin = resposta.data.ttl_min ?? this.ttlMin
        this.diaSelecionado = dia
        this.slot = slot
        this.formulario = null
        this.marcarSlotStatus(dia, slot.horario, 'bloqueado_por_mim')

        return resposta.data
      } finally {
        this.bloqueando = false
      }
    },

    /**
     * Libera o bloqueio temporário no backend (se houver) e no estado local.
     * O TTL do servidor cobre falhas de rede/aba fechada.
     */
    async liberarBloqueio() {
      const token = this.bloqueio?.token
      const dia = this.diaSelecionado
      const horario = this.slot?.horario

      this.bloqueio = null
      this.slot = null
      if (horario) this.marcarSlotStatus(dia, horario, 'livre')

      if (!token) return

      try {
        await api.delete(`/agendamento-fluxo/bloqueios/${token}`)
      } catch (erro) {
        console.warn('Não foi possível liberar o bloqueio temporário:', erro)
      }
    },

    /**
     * Chamado ao sair de qualquer tela do fluxo: libera o bloqueio e zera tudo.
     */
    async sairDoFluxo() {
      await this.liberarBloqueio()
      this.$reset()
    },

    /**
     * Zera o estado local sem chamar o backend. Usado após salvar com sucesso
     * (o servidor já converteu o bloqueio em agendamento).
     */
    finalizarFluxo() {
      this.$reset()
    },
  },
})
