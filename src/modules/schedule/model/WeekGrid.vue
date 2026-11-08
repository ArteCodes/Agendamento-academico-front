<template>
  <section class="semana-grid">
    <div v-for="dia in dias" :key="dia.valor" class="dia-coluna">
      <header class="dia-titulo">{{ dia.nome }}</header>
      <div class="dia-lista">
        <div v-if="(porDia[dia.valor] || []).length === 0" class="dia-vazio">Sem horários</div>
        <article
          v-for="h in (porDia[dia.valor] || [])"
          :key="`${h.origem}-${h.id ?? h.tempId}`"
          class="horario-card"
          :class="{ 'eh-rascunho': h.origem === 'rascunho' }"
        >
          <div class="horario-tempo">{{ h.hora_inicio }} - {{ h.hora_fim }}</div>
          <div class="horario-tipo">{{ h.tipo }}</div>
          <div class="horario-meta">
            <span v-if="h.origem === 'rascunho'" class="badge-novo">Novo</span>
            <button
              v-if="h.origem === 'rascunho'"
              type="button"
              class="btn-mini btn-remover"
              @click="$emit('remover-rascunho', h)"
            >
              Remover
            </button>
            <button
              v-else
              type="button"
              class="btn-mini btn-excluir"
              @click="$emit('remover-salvo', h)"
            >
              Excluir
            </button>
          </div>
        </article>
        <!-- Botão de adicionar horário -->
        <button
          v-if="!metaConcluida"
          type="button"
          class="btn-mais"
          :title="`Adicionar horário em ${dia.nome}`"
          @click="$emit('adicionar', dia.valor)"
        >
          +
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  dias: { type: Array, default: () => [] },
  porDia: { type: Object, default: () => ({}) },
  metaConcluida: { type: Boolean, default: false }
})

defineEmits(['adicionar', 'remover-rascunho', 'remover-salvo'])
</script>

<style scoped>
.semana-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 900px) {
  .semana-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* ── Coluna de dia ── */
.dia-coluna {
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}

.dia-titulo {
  background: var(--ser-gray-50, #f7f9fc);
  padding: 10px 12px;
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--ser-navy, #003087);
  text-align: center;
  border-bottom: 2px solid var(--ser-navy, #003087);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dia-lista {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
}

.dia-vazio {
  color: var(--ser-gray-300, #c0cad9);
  font-size: 0.8rem;
  text-align: center;
  padding: 12px 0;
}

/* ── Cards de horário ── */
.horario-card {
  border: 1px solid var(--color-border, #dde3ef);
  border-left: 3px solid var(--ser-navy, #003087);
  border-radius: var(--radius-md, 8px);
  padding: 8px 10px;
  background: var(--ser-gray-50, #f7f9fc);
}

.horario-card.eh-rascunho {
  border-left-color: #b45309;
  background: rgba(180, 83, 9, 0.04);
}

.horario-tempo {
  font-weight: 700;
  color: var(--ser-navy, #003087);
  font-size: 0.875rem;
}

.horario-tipo {
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.75rem;
  margin-top: 2px;
}

.horario-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.badge-novo {
  background: rgba(180, 83, 9, 0.10);
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.25);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-mini {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  font-family: inherit;
  transition: background 0.15s;
}

.btn-remover {
  color: #b45309;
}

.btn-remover:hover {
  background: rgba(180, 83, 9, 0.08);
}

.btn-excluir {
  color: var(--ser-red, #C8102E);
}

.btn-excluir:hover {
  background: rgba(200, 16, 46, 0.08);
}

/* ── Botão adicionar ── */
.btn-mais {
  border: 1.5px dashed var(--ser-gray-300, #c0cad9);
  background: transparent;
  border-radius: var(--radius-md, 8px);
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--ser-gray-500, #6b7a99);
  cursor: pointer;
  padding: 4px 0;
  width: 100%;
  transition: border-color 0.18s, color 0.18s, background 0.18s;
  font-family: inherit;
}

.btn-mais:hover {
  background: rgba(0, 48, 135, 0.04);
  border-color: var(--ser-navy, #003087);
  color: var(--ser-navy, #003087);
}
</style>
