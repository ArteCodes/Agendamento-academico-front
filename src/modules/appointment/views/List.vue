<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth'
import { useAppointmentStore } from '@/modules/appointment/store/appointment'
import { useDataStore } from '@/modules/data/store/data'
import TableList from '@/modules/appointment/model/TableList.vue'
import FormShow from '@/modules/appointment/model/FormShow.vue'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const dataStore = useDataStore()
const { userName, user, isCoordenador, isSuporte, canCreate } = storeToRefs(authStore)

const filtroData = ref('')
const showModal = ref(false)
const showDetailsModal = ref(false)
const selectedAgendamento = ref(null)

// Lista unificada por função (IDs):
// aluno -> created_by/matricula/email próprios | coordenador -> coordinator_id == id | suporte -> created_by == id
const agendamentosVisiveis = computed(() => appointmentStore.visiveisPorFuncao(user.value))

// Oculta agendamentos com data anterior a hoje (preserva hoje e futuros)
const agendamentosSemPassados = computed(() =>
  agendamentosVisiveis.value.filter((a) => dataStore.isDateTodayOrFuture(a.data))
)

const agendamentosFiltrados = computed(() => {
  if (!filtroData.value) return agendamentosSemPassados.value
  return agendamentosSemPassados.value.filter((i) => i.data === filtroData.value)
})
// Coluna Aluno só faz sentido para quem vê agendamentos de terceiros
const showAlunoColumn = computed(() => isCoordenador.value || isSuporte.value)
// Coordenador não cancela pela lista (só valida no Show); aluno/suporte cancelam os próprios
const canCancel = computed(() => !isCoordenador.value)
const confirmCancel = (ag) => { selectedAgendamento.value = ag; showModal.value = true }
const cancelAgendamento = () => {
  if (selectedAgendamento.value) appointmentStore.cancelarAgendamento(selectedAgendamento.value.id)
  closeModals()
}
const showDetails = (ag) => { selectedAgendamento.value = ag; showDetailsModal.value = true }
const closeModals = () => { showModal.value = false; showDetailsModal.value = false; selectedAgendamento.value = null }
const navegarParaCriar = () => router.push('/agendamentos/criar')
const abrirShow = (ag) => router.push(`/agendamentos/${ag.id}`)
</script>

<template>
  <div class="aluno-dashboard">
    <!-- Cabeçalho da página -->
    <header class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Meus Agendamentos</h1>
        <p class="page-subtitle">Bem-vindo(a), {{ userName }}. Gerencie seus atendimentos abaixo.</p>
      </div>
      <button v-if="canCreate" type="button" class="btn-primary" @click="navegarParaCriar">
        Novo Agendamento
      </button>
    </header>

    <!-- Barra de filtros -->
    <section class="controls-bar">
      <div class="filter-group">
        <label for="filtro-data" class="filter-label">Filtrar por data</label>
        <div class="filter-row">
          <input id="filtro-data" type="date" v-model="filtroData" class="input-date" />
          <button v-if="filtroData" type="button" class="btn-clear" @click="filtroData = ''">
            Limpar
          </button>
        </div>
      </div>
    </section>

    <!-- Tabela -->
    <TableList
      :items="agendamentosFiltrados"
      :show-aluno-column="showAlunoColumn"
      :can-cancel="canCancel"
      @cancel="confirmCancel"
      @show="abrirShow"
    />

    <!-- Modal de cancelamento -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Confirmar Cancelamento</h3>
          <button type="button" class="btn-close-icon" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body-text">
          <p>Tem certeza que deseja cancelar o agendamento <strong>{{ selectedAgendamento?.nome }}</strong>?</p>
          <p class="modal-warning-note">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModals">Não, manter</button>
          <button type="button" class="btn-danger" @click="cancelAgendamento">Sim, cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de detalhes -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Detalhes do Agendamento</h3>
          <button type="button" class="btn-close-icon" @click="closeModals">&times;</button>
        </div>
        <FormShow :item="selectedAgendamento" />
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModals">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aluno-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  color: var(--color-text, #0d1b3e);
}

/* ── Cabeçalho ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin-top: 4px;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
}

/* ── Botões ── */
.btn-primary {
  padding: 10px 22px;
  background: var(--ser-navy, #003087);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  letter-spacing: 0.01em;
}

.btn-primary:hover {
  background: var(--ser-navy-light, #0045b5);
  box-shadow: 0 4px 12px rgba(0, 48, 135, 0.25);
}

/* ── Filtros ── */
.controls-bar {
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-500, #6b7a99);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-date {
  padding: 9px 12px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  color: var(--color-text, #0d1b3e);
  outline: none;
  font-family: inherit;
  transition: border-color 0.18s;
}

.input-date:focus {
  border-color: var(--ser-navy, #003087);
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.10);
}

.btn-clear {
  padding: 8px 14px;
  border: 1.5px solid var(--color-border, #dde3ef);
  background: var(--ser-white, #fff);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  color: var(--ser-gray-700, #374569);
  cursor: pointer;
  transition: background 0.18s;
}

.btn-clear:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Modais ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 27, 62, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(2px);
}

.modal-box {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 48, 135, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  background: var(--ser-gray-50, #f7f9fc);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
}

.btn-close-icon {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ser-gray-500, #6b7a99);
  line-height: 1;
  transition: color 0.15s;
}

.btn-close-icon:hover {
  color: var(--ser-gray-900, #0d1b3e);
}

.modal-body-text {
  padding: 24px;
  color: var(--ser-gray-700, #374569);
  font-size: 0.9375rem;
}

.modal-warning-note {
  margin-top: 8px;
  font-size: 0.8125rem;
  color: var(--ser-gray-500, #6b7a99);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: var(--ser-gray-50, #f7f9fc);
  border-top: 1px solid var(--color-border, #dde3ef);
}

.btn-secondary {
  padding: 9px 20px;
  background: var(--ser-white, #fff);
  color: var(--ser-gray-700, #374569);
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
}

.btn-secondary:hover {
  background: var(--ser-gray-100, #eef1f7);
}

.btn-danger {
  padding: 9px 20px;
  background: var(--ser-red, #C8102E);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}

.btn-danger:hover {
  background: var(--ser-red-dark, #9e0c24);
}
</style>
