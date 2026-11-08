<template>
  <div class="modal-corpo">
    <div class="item-detalhe">
      <span class="rotulo-detalhe">Aluno</span>
      <span class="valor-detalhe">{{ item.aluno }}</span>
    </div>
    <div class="item-detalhe">
      <span class="rotulo-detalhe">Tipo de Atendimento</span>
      <span class="valor-detalhe">{{ item.nome }}</span>
    </div>
    <div class="item-detalhe">
      <span class="rotulo-detalhe">Data</span>
      <span class="valor-detalhe">{{ item.data }}</span>
    </div>
    <div class="item-detalhe">
      <span class="rotulo-detalhe">Horário</span>
      <span class="valor-detalhe">{{ item.horario }}</span>
    </div>
    <div class="item-detalhe">
      <span class="rotulo-detalhe">Status</span>
      <span :class="['badge-status', `badge-${item.status.toLowerCase()}`]">
        {{ item.status }}
      </span>
    </div>
    <div v-if="item.local" class="item-detalhe">
      <span class="rotulo-detalhe">Local</span>
      <span class="valor-detalhe">{{ item.local }}</span>
    </div>
    <div v-if="item.descricao" class="item-detalhe">
      <span class="rotulo-detalhe">Descrição</span>
      <span class="valor-detalhe">{{ item.descricao }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true }
})
</script>

<style scoped>
.modal-corpo {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.item-detalhe {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  gap: 16px;
}

.item-detalhe:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.rotulo-detalhe {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-500, #6b7a99);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.valor-detalhe {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ser-gray-900, #0d1b3e);
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 20px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.badge-pendente {
  background: rgba(180, 83, 9, 0.10);
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.25);
}

.badge-confirmado {
  background: rgba(10, 122, 74, 0.10);
  color: #0a7a4a;
  border: 1px solid rgba(10, 122, 74, 0.25);
}

.badge-cancelado {
  background: rgba(200, 16, 46, 0.10);
  color: #C8102E;
  border: 1px solid rgba(200, 16, 46, 0.25);
}
</style>
