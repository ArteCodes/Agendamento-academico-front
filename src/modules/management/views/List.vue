<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth'
import { useManagementStore } from '@/modules/management/store/management'
import { useDataStore } from '@/modules/data/store/data'
import TableList from '@/modules/management/model/TableList.vue'
import FormShow from '@/modules/management/model/FormShow.vue'

const authStore = useAuthStore()
const { userName } = storeToRefs(authStore)
const managementStore = useManagementStore()
const dataStore = useDataStore()
const { agendamentos: agendamentosTodos, totalAgendamentos, totalPendentes, totalConfirmados } = storeToRefs(managementStore)

// Oculta agendamentos com data anterior a hoje (preserva hoje e futuros)
const agendamentos = computed(() =>
  agendamentosTodos.value.filter((a) => dataStore.isDateTodayOrFuture(a.data))
)

const agendamentoSelecionado = ref(null)
const exibirModalDetalhes = ref(false)
const validarAgendamento = (ag) => managementStore.validarAgendamento(ag.id)
const abrirDetalhes = (ag) => { agendamentoSelecionado.value = ag; exibirModalDetalhes.value = true }
const fecharModal = () => { exibirModalDetalhes.value = false; agendamentoSelecionado.value = null }
</script>

<template>
  <div class="painel-gestao">
    <!-- Cabeçalho -->
    <header class="painel-header">
      <div>
        <h1 class="painel-titulo">Painel de Gestão</h1>
        <p class="painel-subtitulo">Bem-vindo(a), {{ userName }}. Gerencie os agendamentos abaixo.</p>
      </div>
    </header>

    <!-- Cards de métricas -->
    <section class="metricas-container">
      <div class="card-metrica">
        <span class="metrica-rotulo">Total de Agendamentos</span>
        <span class="metrica-valor">{{ totalAgendamentos }}</span>
        <div class="metrica-barra metrica-barra-azul"></div>
      </div>
      <div class="card-metrica">
        <span class="metrica-rotulo">Pendentes</span>
        <span class="metrica-valor valor-laranja">{{ totalPendentes }}</span>
        <div class="metrica-barra metrica-barra-laranja"></div>
      </div>
      <div class="card-metrica">
        <span class="metrica-rotulo">Confirmados</span>
        <span class="metrica-valor valor-verde">{{ totalConfirmados }}</span>
        <div class="metrica-barra metrica-barra-verde"></div>
      </div>
    </section>

    <!-- Tabela de agendamentos -->
    <section class="tabela-secao">
      <TableList :items="agendamentos" @validate="validarAgendamento" @show="abrirDetalhes" />
    </section>

    <!-- Modal de detalhes -->
    <div v-if="exibirModalDetalhes && agendamentoSelecionado" class="modal-backdrop" @click.self="fecharModal">
      <div class="modal-card">
        <header class="modal-cabecalho">
          <h2 class="modal-titulo">Detalhes do Agendamento</h2>
          <button type="button" class="btn-fechar-icone" @click="fecharModal">&times;</button>
        </header>
        <FormShow :item="agendamentoSelecionado" />
        <footer class="modal-rodape">
          <button v-if="agendamentoSelecionado.status === 'Pendente'" type="button" class="btn-acao btn-validar" @click="validarAgendamento(agendamentoSelecionado)">
            Confirmar Agendamento
          </button>
          <button type="button" class="btn-acao btn-fechar-modal" @click="fecharModal">Fechar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.painel-gestao {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  color: var(--color-text, #0d1b3e);
}

/* ── Cabeçalho ── */
.painel-header {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
}

.painel-titulo {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.painel-subtitulo {
  margin-top: 4px;
  color: #1e3a8a;
  font-size: 0.95rem;
  font-weight: 500;
}

/* ── Métricas ── */
.metricas-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 640px) {
  .metricas-container {
    grid-template-columns: 1fr;
  }
}

.card-metrica {
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-lg, 12px);
  padding: 20px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.metrica-rotulo {
  font-size: 0.75rem;
  font-weight: 700;
  color: #003087;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metrica-valor {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  line-height: 1;
}

.valor-laranja { color: #b45309; }
.valor-verde   { color: #0a7a4a; }

.metrica-barra {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 2px 2px 0;
}

.metrica-barra-azul   { background: var(--ser-navy, #003087); }
.metrica-barra-laranja { background: #b45309; }
.metrica-barra-verde  { background: #0a7a4a; }

/* ── Tabela ── */
.tabela-secao {
  /* conteúdo gerenciado pelo TableList */
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(13, 27, 62, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 48, 135, 0.2);
}

.modal-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  background: var(--ser-gray-50, #f7f9fc);
}

.modal-titulo {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ser-navy, #003087);
}

.btn-fechar-icone {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ser-gray-500, #6b7a99);
  line-height: 1;
  transition: color 0.15s;
}

.btn-fechar-icone:hover {
  color: var(--ser-gray-900, #0d1b3e);
}

.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  background: var(--ser-gray-50, #f7f9fc);
  border-top: 1px solid var(--color-border, #dde3ef);
}

.btn-acao {
  padding: 9px 20px;
  border-radius: var(--radius-md, 8px);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.18s, opacity 0.18s;
}

.btn-validar {
  background: var(--color-success, #0a7a4a);
  color: #fff;
}

.btn-validar:hover {
  background: #086040;
}

.btn-fechar-modal {
  background: var(--ser-white, #fff);
  color: var(--ser-gray-700, #374569);
  border: 1.5px solid var(--color-border, #dde3ef) !important;
}

.btn-fechar-modal:hover {
  background: var(--ser-gray-100, #eef1f7);
}
</style>
