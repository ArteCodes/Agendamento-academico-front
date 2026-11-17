import { defineStore } from 'pinia'
import api from '@/services/api'

/**
 * schedule.js — store do módulo schedule (Gestão de Horários / Coordenador).
 * Horários semanais recorrentes (Seg-Dom), agora com persistência via backend (Supabase/FastAPI).
 * Item: { id, coordinator_id, dia_semana (0=Dom..6=Sab), hora_inicio "HH:MM", duracao_min, hora_fim "HH:MM", tipo }
 */

export function somarMinutos(horaStr, minutos) {
  const [h, m] = String(horaStr || '00:00').split(':').map(Number)
  const total = (h || 0) * 60 + (m || 0) + (minutos || 0)
  if (total < 0 || total > 24 * 60) return null
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export function paraMinutos(horaStr) {
  const [h, m] = String(horaStr || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    // Horários CONFIRMADOS vindos do backend
    salvos: [],
    loading: false,
    error: null,
  }),

  getters: {
    porCoordenador: (state) => (coordId) => {
      if (coordId == null) return []
      return state.salvos.filter((s) => s.coordinator_id === coordId)
    },
    totalMinSalvos: (state) => (coordId) => {
      if (coordId == null) return 0
      return state.salvos
        .filter((s) => s.coordinator_id === coordId)
        .reduce((acc, s) => acc + (Number(s.duracao_min) || 0), 0)
    },
  },

  actions: {
    /**
     * Busca horários de um coordenador no backend.
     * GET /api/horarios?coordinator_id={coordId}
     */
    async fetchHorarios(coordId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/horarios', {
          params: { coordinator_id: coordId },
        })
        this.salvos = response.data || []
        return this.salvos
      } catch (err) {
        this.error = err.message || 'Erro ao buscar horários do servidor.'
        console.error('Erro ao buscar horários:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Cria um único horário no backend.
     * POST /api/horarios
     */
    async criarHorario(dados) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/horarios', dados)
        const novo = response.data
        this.salvos.push(novo)
        return novo
      } catch (err) {
        this.error = err.message || 'Erro ao criar horário.'
        console.error('Erro ao criar horário:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Atualiza um horário existente no backend.
     * PATCH /api/horarios/{id}
     */
    async atualizarHorario(id, dados) {
      this.loading = true
      this.error = null
      try {
        const response = await api.patch(`/horarios/${id}`, dados)
        const atualizado = response.data
        const idx = this.salvos.findIndex((s) => s.id === id)
        if (idx !== -1) this.salvos[idx] = atualizado
        return atualizado
      } catch (err) {
        this.error = err.message || 'Erro ao atualizar horário.'
        console.error('Erro ao atualizar horário:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove um horário do backend.
     * DELETE /api/horarios/{id}
     */
    async removerHorario(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/horarios/${id}`)
        this.salvos = this.salvos.filter((s) => s.id !== id)
      } catch (err) {
        this.error = err.message || 'Erro ao remover horário.'
        console.error('Erro ao remover horário:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Salva um lote de horários (rascunho → confirmado) via backend.
     * Envia vários POST em paralelo (Promise.all).
     */
    async salvarLote(coordId, novos) {
      this.loading = true
      this.error = null
      try {
        const criados = await Promise.all(
          (novos || []).map((n) =>
            this.criarHorario({
              coordinator_id: coordId,
              dia_semana: Number(n.dia_semana),
              hora_inicio: n.hora_inicio,
              duracao_min: Number(n.duracao_min),
              tipo: n.tipo || 'Atendimento',
            })
          )
        )
        return criados
      } catch (err) {
        this.error = err.message || 'Erro ao salvar lote de horários.'
        console.error('Erro ao salvar lote:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove um horário salvo (confirmação) do backend.
     */
    async removerSalvo(id, coordId) {
      await this.removerHorario(id)
    },

    /**
     * Verifica sobreposição de horários contra os dados salvos no estado.
     */
    temSobreposicao(coordId, diaSemana, horaInicio, duracaoMin, ignorarId = null) {
      const ini = paraMinutos(horaInicio)
      const fim = ini + Number(duracaoMin)
      return this.salvos.some((s) => {
        if (s.coordinator_id !== coordId) return false
        if (Number(s.dia_semana) !== Number(diaSemana)) return false
        if (ignorarId != null && s.id === ignorarId) return false
        const sIni = paraMinutos(s.hora_inicio)
        const sFim = sIni + Number(s.duracao_min)
        return ini < sFim && fim > sIni
      })
    },
  },
})