<template>
  <div v-if="item" class="detail-body">
    <div class="detail-row">
      <span class="detail-label">Tipo de Atendimento</span>
      <span class="detail-value">{{ item.nome }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="status-badge" :class="getStatusBadgeClass(item.status)">
        {{ item.status }}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Data</span>
      <span class="detail-value">{{ formatarData(item.data) }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Horário</span>
      <span class="detail-value">{{ item.horario }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Local</span>
      <span class="detail-value">{{ item.local }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Descrição</span>
      <span class="detail-value">{{ item.descricao }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, default: null }
})

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const partes = dataStr.split('-')
  if (partes.length === 3) {
    const [ano, mes, dia] = partes
    return `${dia}/${mes}/${ano}`
  }
  return dataStr
}

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
.detail-body {
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  font-size: 0.9375rem;
  gap: 16px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-500, #6b7a99);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.detail-value {
  color: var(--ser-gray-900, #0d1b3e);
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

/* Badges de Status */
.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
  letter-spacing: 0.06em;
  text-transform: uppercase;
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
</style>
