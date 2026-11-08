<template>
  <div class="calendario-layout">
    <section class="calendario-box">
      <div class="calendario-nav">
        <h2>{{ monthName }} <span class="ano-texto">{{ year }}</span></h2>
        <div class="nav-botoes">
          <button type="button" class="btn-nav" @click="$emit('prev')">&lsaquo;</button>
          <button type="button" class="btn-hoje" @click="$emit('today')">Hoje</button>
          <button type="button" class="btn-nav" @click="$emit('next')">&rsaquo;</button>
        </div>
      </div>
      <div class="dias-semana-header">
        <div v-for="d in weekDays" :key="d" class="dia-semana-col">{{ d }}</div>
      </div>
      <div class="grade-dias">
        <div
          v-for="(dia, idx) in days"
          :key="idx"
          class="dia-celula"
          :class="{ 'fora-do-mes': !dia.mesAtual, 'dia-ativo': dia.dataIso === selectedDay, 'tem-atendimento': dia.agendamentos.length > 0 }"
          @click="$emit('select', dia)"
        >
          <div class="dia-topo">
            <span class="dia-numero">{{ dia.numero }}</span>
            <span v-if="dia.agendamentos.length > 0" class="badge-qtd">{{ dia.agendamentos.length }}</span>
          </div>
          <div class="dia-eventos" v-if="dia.agendamentos.length > 0">
            <div v-for="ag in dia.agendamentos.slice(0, 2)" :key="ag.id" class="evento-chip">{{ ag.horario }} {{ ag.aluno.split(' ')[0] }}</div>
            <div v-if="dia.agendamentos.length > 2" class="mais-eventos">+{{ dia.agendamentos.length - 2 }}</div>
          </div>
        </div>
      </div>
    </section>

    <aside class="painel-dia">
      <div class="painel-dia-header">
        <h3 class="painel-dia-titulo">Atendimentos do Dia</h3>
        <span v-if="formattedSelectedDay" class="data-tag">{{ formattedSelectedDay }}</span>
      </div>
      <div v-if="dayItems.length > 0" class="lista-atendimentos">
        <div v-for="ag in dayItems" :key="ag.id" class="card-atendimento-dia">
          <div class="card-info-linha">
            <span class="horario-badge">{{ ag.horario }}</span>
            <span class="local-badge">{{ ag.local }}</span>
          </div>
          <h4 class="atendimento-titulo">{{ ag.nome }}</h4>
          <div class="atendimento-detalhe"><strong>Aluno:</strong> {{ ag.aluno }}</div>
          <p class="atendimento-descricao" v-if="ag.descricao">{{ ag.descricao }}</p>
          <div class="card-footer-acoes">
            <span class="badge-status-confirmado">Confirmado</span>
          </div>
        </div>
      </div>
      <div v-else class="painel-vazio">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 12px; opacity: 0.5">
          <rect x="6" y="10" width="36" height="32" rx="4" stroke="#c0cad9" stroke-width="2"/>
          <path d="M6 18h36" stroke="#c0cad9" stroke-width="2"/>
          <path d="M16 6v8M32 6v8" stroke="#c0cad9" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p class="texto-vazio-titulo">Nenhum atendimento neste dia</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
defineProps({
  days: { type: Array, default: () => [] },
  dayItems: { type: Array, default: () => [] },
  weekDays: { type: Array, default: () => [] },
  monthName: { type: String, default: '' },
  year: { type: Number, default: 2026 },
  selectedDay: { type: String, default: '' },
  formattedSelectedDay: { type: String, default: '' }
})
defineEmits(['prev', 'next', 'today', 'select'])
</script>

<style scoped>
.calendario-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 960px) {
  .calendario-layout {
    grid-template-columns: 2fr 1fr;
  }
}

/* ── Calendário ── */
.calendario-box {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  border: 1px solid var(--color-border, #dde3ef);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.calendario-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendario-nav h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--ser-navy, #003087);
  font-weight: 800;
}

.ano-texto {
  color: var(--ser-gray-500, #6b7a99);
  font-weight: 400;
  margin-left: 4px;
}

.nav-botoes {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-nav {
  background: var(--ser-white, #fff);
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  padding: 6px 14px;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--ser-gray-700, #374569);
  transition: background 0.18s;
  font-family: inherit;
}

.btn-nav:hover {
  background: var(--ser-gray-100, #eef1f7);
}

.btn-hoje {
  background: var(--ser-navy, #003087);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  padding: 6px 16px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background 0.18s;
  font-family: inherit;
}

.btn-hoje:hover {
  background: var(--ser-navy-light, #0045b5);
}

.dias-semana-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.dia-semana-col {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ser-gray-500, #6b7a99);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 0;
}

.grade-dias {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.dia-celula {
  min-height: 80px;
  border: 1px solid var(--ser-gray-100, #eef1f7);
  border-radius: var(--radius-md, 8px);
  padding: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.dia-celula:hover {
  border-color: var(--ser-gray-300, #c0cad9);
  background: var(--ser-gray-50, #f7f9fc);
}

.dia-celula.fora-do-mes {
  opacity: 0.35;
}

.dia-celula.dia-ativo {
  border-color: var(--ser-navy, #003087);
  background: rgba(0, 48, 135, 0.05);
}

.dia-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dia-numero {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--ser-gray-900, #0d1b3e);
}

.dia-celula.dia-ativo .dia-numero {
  color: var(--ser-navy, #003087);
}

.badge-qtd {
  background: var(--color-success, #0a7a4a);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 6px;
}

.dia-eventos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.evento-chip {
  background: rgba(0, 48, 135, 0.07);
  border-left: 2px solid var(--ser-navy, #003087);
  font-size: 0.65rem;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ser-navy, #003087);
}

.mais-eventos {
  font-size: 0.65rem;
  color: var(--ser-gray-500, #6b7a99);
  padding-left: 4px;
}

/* ── Painel lateral ── */
.painel-dia {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--color-border, #dde3ef);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
  overflow-y: auto;
  max-height: 600px;
}

.painel-dia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  padding-bottom: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.painel-dia-titulo {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
}

.data-tag {
  background: var(--ser-gray-100, #eef1f7);
  color: var(--ser-gray-700, #374569);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.lista-atendimentos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-atendimento-dia {
  border: 1px solid var(--color-border, #dde3ef);
  border-left: 4px solid var(--ser-navy, #003087);
  border-radius: var(--radius-md, 8px);
  padding: 14px;
  background: var(--ser-gray-50, #f7f9fc);
}

.card-info-linha {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.horario-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
  background: rgba(0, 48, 135, 0.08);
  padding: 2px 10px;
  border-radius: 20px;
}

.local-badge {
  font-size: 0.75rem;
  color: var(--ser-gray-500, #6b7a99);
  background: var(--ser-gray-100, #eef1f7);
  padding: 2px 10px;
  border-radius: 20px;
}

.atendimento-titulo {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
  margin: 0 0 6px;
}

.atendimento-detalhe {
  font-size: 0.8125rem;
  color: var(--ser-gray-700, #374569);
  margin-bottom: 4px;
}

.atendimento-descricao {
  font-size: 0.8rem;
  color: var(--ser-gray-500, #6b7a99);
  margin-bottom: 10px;
  line-height: 1.5;
}

.card-footer-acoes {
  display: flex;
  justify-content: flex-end;
}

.badge-status-confirmado {
  background: rgba(10, 122, 74, 0.10);
  color: #0a7a4a;
  border: 1px solid rgba(10, 122, 74, 0.25);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.painel-vazio {
  text-align: center;
  padding: 40px 16px;
  color: var(--ser-gray-500, #6b7a99);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.texto-vazio-titulo {
  font-size: 0.875rem;
  color: var(--ser-gray-500, #6b7a99);
}
</style>
