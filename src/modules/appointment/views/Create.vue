<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth'
import { useAppointmentStore } from '@/modules/appointment/store/appointment'
import FormCreate from '@/modules/appointment/model/FormCreate.vue'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const { userName, user } = storeToRefs(authStore)

const form = reactive({ tipo: 'Consulta Psicológica', data: '', horario: '', local: 'Sala de Atendimento', descricao: '' })
const updateField = ({ field, value }) => { form[field] = value }
const voltar = () => router.push('/agendamentos')
const handleSalvar = () => {
  if (!form.tipo || !form.data || !form.horario) { alert('Por favor, preencha tipo, data e horário.'); return }
  appointmentStore.criarAgendamento({
    aluno: userName.value || 'Aluno',
    alunoEmail: user.value?.email || 'aluno@teste.com',
    aluno_matricula: user.value?.matricula || null,
    created_by: user.value?.id ?? null,
    coordinator_id: 2,
    nome: form.tipo, data: form.data, horario: form.horario, local: form.local || 'A definir', descricao: form.descricao
  }, user.value)
  router.push('/agendamentos')
}
</script>

<template>
  <div class="criar-container">
    <div class="criar-wrapper">
      <!-- Cabeçalho da página -->
      <div class="criar-header">
        <div>
          <h1 class="criar-title">Novo Agendamento</h1>
          <p class="criar-subtitle">Preencha os dados abaixo para solicitar um atendimento</p>
        </div>
        <button type="button" class="btn-voltar" @click="voltar">Voltar</button>
      </div>

      <!-- Card do formulário -->
      <div class="criar-card">
        <FormCreate :form="form" @update:field="updateField" @cancel="voltar" @submit="handleSalvar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.criar-container {
  min-height: calc(100vh - 64px);
  background: var(--color-bg, #f7f9fc);
  padding: 40px 24px;
}

.criar-wrapper {
  max-width: 620px;
  margin: 0 auto;
}

/* ── Cabeçalho ── */
.criar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.criar-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.criar-subtitle {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--ser-gray-500, #6b7a99);
}

.btn-voltar {
  padding: 8px 18px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  color: var(--ser-gray-700, #374569);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  white-space: nowrap;
}

.btn-voltar:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Card ── */
.criar-card {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border-top: 4px solid var(--ser-navy, #003087);
  padding: 36px 32px;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 48, 135, 0.12));
}
</style>
