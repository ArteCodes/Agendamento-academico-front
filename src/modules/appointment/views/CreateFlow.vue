<template>
  <div class="fluxo-container">
    <div class="fluxo-wrapper">
      <header class="fluxo-header">
        <div class="fluxo-header-texto">
          <h1 class="fluxo-titulo">Novo Agendamento</h1>
          <p class="fluxo-subtitulo">Siga as etapas para solicitar seu atendimento</p>
        </div>
        <button type="button" class="btn-voltar" @click="voltarParaLista">Voltar</button>
      </header>

      <nav class="progresso" aria-label="Etapas do agendamento">
        <div
          v-for="(etapa, indice) in etapas"
          :key="etapa.chave"
          class="progresso-item"
          :class="{
            'progresso-item--atual': indice === indiceAtual,
            'progresso-item--concluida': indice < indiceAtual,
          }"
        >
          <span class="progresso-numero">{{ indice + 1 }}</span>
          <span class="progresso-rotulo">{{ etapa.rotulo }}</span>
        </div>
      </nav>

      <main class="fluxo-conteudo">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useCreateFlowStore } from '@/modules/appointment/store/createFlow'

const router = useRouter()
const route = useRoute()
const fluxo = useCreateFlowStore()

const etapas = [
  { chave: 'criar-faq', rotulo: 'Dúvidas' },
  { chave: 'criar-coordenadores', rotulo: 'Coordenadores' },
  { chave: 'criar-horarios', rotulo: 'Horários' },
  { chave: 'criar-formulario', rotulo: 'Formulário' },
  { chave: 'criar-resumo', rotulo: 'Resumo' },
]

const indiceAtual = computed(() => {
  const indice = etapas.findIndex((etapa) => etapa.chave === route.name)
  return indice === -1 ? 0 : indice
})

function voltarParaLista() {
  router.push({ name: 'agendamentos' })
}

/**
 * Ao sair do fluxo (qualquer rota fora de /agendamentos/criar), libera o
 * bloqueio temporário e zera o estado.
 */
onBeforeRouteLeave(async (to) => {
  if (!to.path.startsWith('/agendamentos/criar')) {
    await fluxo.sairDoFluxo()
  }
  return true
})
</script>

<style scoped>
.fluxo-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg, #f7f9fc);
  padding: 40px 24px;
}

.fluxo-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Cabeçalho ── */
.fluxo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.fluxo-titulo {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.fluxo-subtitulo {
  margin: 4px 0 0;
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
  font-family: inherit;
}

.btn-voltar:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Progresso ── */
.progresso {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  margin-bottom: 24px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
  overflow-x: auto;
}

.progresso-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: max-content;
  padding-right: 8px;
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.8125rem;
  font-weight: 600;
}

.progresso-item + .progresso-item {
  border-left: 1px solid var(--color-border, #dde3ef);
  padding-left: 16px;
}

.progresso-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ser-gray-100, #eef1f7);
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.progresso-item--atual {
  color: var(--ser-navy, #003087);
}

.progresso-item--atual .progresso-numero {
  background: var(--ser-navy, #003087);
  color: #fff;
}

.progresso-item--concluida {
  color: var(--color-success, #0a7a4a);
}

.progresso-item--concluida .progresso-numero {
  background: rgba(10, 122, 74, 0.12);
  color: var(--color-success, #0a7a4a);
}

/* ── Conteúdo ── */
.fluxo-conteudo {
  padding-bottom: 8px;
}

@media (max-width: 720px) {
  .fluxo-container {
    padding: 24px 16px;
  }

  .progresso-rotulo {
    display: none;
  }

  .progresso-item {
    justify-content: center;
  }
}
</style>
