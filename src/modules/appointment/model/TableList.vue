<template>
  <main class="cards-grid">
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
          <rect x="6" y="10" width="36" height="32" rx="4" stroke="#c0cad9" stroke-width="2"/>
          <path d="M6 18h36" stroke="#c0cad9" stroke-width="2"/>
          <path d="M16 6v8M32 6v8" stroke="#c0cad9" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 28h12M18 34h8" stroke="#c0cad9" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">Nenhum agendamento encontrado</p>
      <p class="empty-desc">Seus agendamentos aparecerão aqui quando disponíveis.</p>
    </div>

    <article v-for="agendamento in items" :key="agendamento.id" class="card-agendamento">
      <!-- Topo do Card com Título e Badge de Status -->
      <div class="card-top">
        <h2 class="card-title">{{ agendamento.nome }}</h2>
        <span class="status-badge" :class="getStatusBadgeClass(agendamento.status)">
          {{ agendamento.status }}
        </span>
      </div>

      <!-- Informações do Agendamento -->
      <div class="card-info">
        <div v-if="showAlunoColumn" class="info-row">
          <span class="info-label">Aluno</span>
          <span class="info-value">{{ agendamento.aluno }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data</span>
          <span class="info-value">{{ formatarData(agendamento.data) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Horário</span>
          <span class="info-value">{{ agendamento.horario }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Local</span>
          <span class="info-value">{{ agendamento.local }}</span>
        </div>
      </div>

      <!-- Botões de Ação do Card (sem Validar na lista: validação só no Show) -->
      <div class="card-actions">
        <button
          v-if="canCancel"
          type="button"
          class="btn-outline-danger"
          :disabled="agendamento.status === 'Cancelado'"
          @click="$emit('cancel', agendamento)"
        >
          Cancelar
        </button>
        <button type="button" class="btn-outline-primary" @click="$emit('show', agendamento)">
          Ver Detalhes
        </button>
      </div>
    </article>
  </main>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  showAlunoColumn: { type: Boolean, default: false },
  canCancel: { type: Boolean, default: true }
})

defineEmits(['cancel', 'show'])

// Formata a data de AAAA-MM-DD para DD/MM/AAAA
const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const partes = dataStr.split('-')
  if (partes.length === 3) {
    const [ano, mes, dia] = partes
    return `${dia}/${mes}/${ano}`
  }
  return dataStr
}

// Retorna a classe CSS correspondente para a cor do status badge
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Confirmado': return 'badge-confirmado'
    case 'Pendente':   return 'badge-pendente'
    case 'Cancelado':  return 'badge-cancelado'
    default:           return ''
  }
}
</script>

<style scoped>
/* Grid de Cards (CSS Grid Responsivo de 1 a 3 colunas) */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Estado Vazio */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 56px 16px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border: 1.5px dashed var(--ser-gray-300, #c0cad9);
  color: var(--ser-gray-500, #6b7a99);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ser-gray-700, #374569);
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--ser-gray-500, #6b7a99);
}

/* Estilo do Card Individual */
.card-agendamento {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--color-border, #dde3ef);
  border-top: 3px solid var(--ser-navy, #003087);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.card-agendamento:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 48, 135, 0.12));
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
  line-height: 1.3;
}

/* Badges de Status */
.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.badge-confirmado {
  background: rgba(10, 122, 74, 0.10);
  color: #0a7a4a;
  border: 1px solid rgba(10, 122, 74, 0.25);
}

.badge-pendente {
  background: rgba(180, 83, 9, 0.10);
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.25);
}

.badge-cancelado {
  background: rgba(200, 16, 46, 0.10);
  color: #C8102E;
  border: 1px solid rgba(200, 16, 46, 0.25);
}

/* Informações do Agendamento dentro do Card */
.card-info {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 5px 0;
  border-bottom: 1px solid var(--ser-gray-100, #eef1f7);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #003087;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  color: var(--ser-gray-900, #0d1b3e);
  font-weight: 500;
  text-align: right;
}

/* Ações do Card */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.card-actions button {
  flex: 1;
}

.btn-outline-danger {
  padding: 8px 10px;
  background: transparent;
  color: var(--ser-red, #C8102E);
  border: 1.5px solid var(--ser-red, #C8102E);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  font-family: inherit;
}

.btn-outline-danger:hover:not(:disabled) {
  background: var(--ser-red, #C8102E);
  color: #fff;
}

.btn-outline-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--ser-gray-300, #c0cad9);
  color: var(--ser-gray-300, #c0cad9);
}

.btn-outline-primary {
  padding: 8px 10px;
  background: transparent;
  color: var(--ser-navy, #003087);
  border: 1.5px solid var(--ser-navy, #003087);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  font-family: inherit;
}

.btn-outline-primary:hover {
  background: var(--ser-navy, #003087);
  color: #fff;
}
</style>
