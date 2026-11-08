<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth'
import { useAppointmentStore } from '@/modules/appointment/store/appointment'
import FormShow from '@/modules/appointment/model/FormShow.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const { user, canValidate } = storeToRefs(authStore)
const item = computed(() => appointmentStore.agendamentos.find((a) => String(a.id) === String(route.params.id)))
// Guard de visibilidade por ID: só mostra se o item está na lista visível da função
const podeVer = computed(() => {
  if (!item.value || !user.value) return false
  return appointmentStore.visiveisPorFuncao(user.value).some((a) => a.id === item.value.id)
})
const podeValidar = computed(() => podeVer.value && canValidate.value && item.value?.status === 'Pendente')
const validar = () => {
  if (!podeValidar.value) return
  appointmentStore.validarAgendamento(item.value.id)
}
const voltar = () => router.push('/agendamentos')
</script>

<template>
  <div class="show-container">
    <div class="show-wrapper">
      <!-- Cabeçalho -->
      <div class="show-header">
        <div>
          <h1 class="show-title">Detalhes do Agendamento</h1>
          <p class="show-subtitle">Informações completas do atendimento</p>
        </div>
        <button type="button" class="btn-voltar" @click="voltar">Voltar</button>
      </div>

      <!-- Card de conteúdo -->
      <div class="show-card">
        <FormShow v-if="item && podeVer" :item="item" />
        <p v-else class="estado-vazio">Agendamento não encontrado ou sem permissão de acesso.</p>

        <div class="show-actions">
          <button v-if="podeValidar" type="button" class="btn-validar" @click="validar">
            Confirmar Agendamento
          </button>
          <button type="button" class="btn-secondary" @click="voltar">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.show-container {
  min-height: calc(100vh - 64px);
  background: var(--color-bg, #f7f9fc);
  padding: 40px 24px;
}

.show-wrapper {
  max-width: 620px;
  margin: 0 auto;
}

/* ── Cabeçalho ── */
.show-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.show-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.show-subtitle {
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
.show-card {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border-top: 4px solid var(--ser-navy, #003087);
  padding: 32px;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 48, 135, 0.12));
}

.estado-vazio {
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.9375rem;
  padding: 16px 0;
}

.show-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #dde3ef);
}

.btn-validar {
  padding: 10px 22px;
  background: var(--color-success, #0a7a4a);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}

.btn-validar:hover {
  background: #086040;
}

.btn-secondary {
  padding: 10px 22px;
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
</style>
