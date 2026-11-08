<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppointmentStore } from '@/modules/appointment/store/appointment'
import TableList from '@/modules/calendar/model/TableList.vue'

const appointmentStore = useAppointmentStore()
const { agendamentosConfirmados } = storeToRefs(appointmentStore)
const dataAtual = ref(new Date(2026, 9, 15))
const diaSelecionado = ref('2026-10-15')
const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const mesAtualNome = computed(() => nomesMeses[dataAtual.value.getMonth()])
const anoAtual = computed(() => dataAtual.value.getFullYear())
const mesAnterior = () => { dataAtual.value = new Date(dataAtual.value.getFullYear(), dataAtual.value.getMonth() - 1, 1) }
const proximoMes = () => { dataAtual.value = new Date(dataAtual.value.getFullYear(), dataAtual.value.getMonth() + 1, 1) }
const irParaHoje = () => { dataAtual.value = new Date(2026, 9, 15); diaSelecionado.value = '2026-10-15' }
const pad = (n) => String(n).padStart(2, '0')
const gradeDias = computed(() => {
  const ano = dataAtual.value.getFullYear(); const mes = dataAtual.value.getMonth()
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate()
  const totalDiasMesAnterior = new Date(ano, mes, 0).getDate()
  const dias = []
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const diaNum = totalDiasMesAnterior - i
    const mesAnt = mes === 0 ? 11 : mes - 1; const anoAnt = mes === 0 ? ano - 1 : ano
    const dataIso = `${anoAnt}-${pad(mesAnt + 1)}-${pad(diaNum)}`
    dias.push({ numero: diaNum, dataIso, mesAtual: false, agendamentos: appointmentStore.confirmadosPorData(dataIso) })
  }
  for (let d = 1; d <= totalDiasMes; d++) {
    const dataIso = `${ano}-${pad(mes + 1)}-${pad(d)}`
    dias.push({ numero: d, dataIso, mesAtual: true, agendamentos: appointmentStore.confirmadosPorData(dataIso) })
  }
  const restante = (7 - (dias.length % 7)) % 7
  for (let p = 1; p <= restante; p++) {
    const mesProx = mes === 11 ? 0 : mes + 1; const anoProx = mes === 11 ? ano + 1 : ano
    const dataIso = `${anoProx}-${pad(mesProx + 1)}-${pad(p)}`
    dias.push({ numero: p, dataIso, mesAtual: false, agendamentos: appointmentStore.confirmadosPorData(dataIso) })
  }
  return dias
})
const agendamentosDia = computed(() => diaSelecionado.value ? appointmentStore.confirmadosPorData(diaSelecionado.value) : [])
const dataFormatada = computed(() => { if (!diaSelecionado.value) return ''; const [a, m, d] = diaSelecionado.value.split('-'); return `${d}/${m}/${a}` })
const selecionarDia = (dia) => { diaSelecionado.value = dia.dataIso }
</script>

<template>
  <div class="calendario-container">
    <!-- Cabeçalho -->
    <header class="header-section">
      <div>
        <h1 class="header-title">Calendário de Atendimento</h1>
        <p class="header-subtitle">Visualização dos agendamentos confirmados</p>
      </div>
      <div class="badge-total">
        <span class="badge-dot"></span>
        <strong>{{ agendamentosConfirmados.length }}</strong>&nbsp;confirmados
      </div>
    </header>

    <TableList
      :days="gradeDias"
      :day-items="agendamentosDia"
      :week-days="diasSemana"
      :month-name="mesAtualNome"
      :year="anoAtual"
      :selected-day="diaSelecionado"
      :formatted-selected-day="dataFormatada"
      @prev="mesAnterior"
      @next="proximoMes"
      @today="irParaHoje"
      @select="selecionarDia"
    />
  </div>
</template>

<style scoped>
.calendario-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 32px 24px;
  color: var(--color-text, #0d1b3e);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
}

.header-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.header-subtitle {
  margin-top: 4px;
  font-size: 0.95rem;
  color: #1e3a8a;
  font-weight: 500;
}

.badge-total {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 122, 74, 0.08);
  border: 1px solid rgba(10, 122, 74, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #0a7a4a;
  font-weight: 500;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #0a7a4a;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
