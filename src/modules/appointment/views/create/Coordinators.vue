<template>
  <section class="coordenadores">
    <div class="coordenadores-intro">
      <div>
        <h2 class="coordenadores-titulo">Escolha um coordenador</h2>
        <p class="coordenadores-texto">
          Selecione com quem deseja conversar. Os horários disponíveis serão mostrados na próxima etapa.
        </p>
      </div>
      <button type="button" class="btn-etapa-anterior" @click="voltarParaFaq">
        ← Voltar às dúvidas
      </button>
    </div>

    <p v-if="carregandoCoordenadores" class="estado-info">Carregando coordenadores...</p>

    <div v-else-if="erroCoordenadores" class="estado-erro">
      <p class="estado-erro-texto">{{ erroCoordenadores }}</p>
      <button type="button" class="btn-tentar" @click="recarregar">Tentar novamente</button>
    </div>

    <p v-else-if="coordenadores.length === 0" class="estado-info">
      Nenhum coordenador disponível no momento.
    </p>

    <div v-else class="coordenadores-grid">
      <CoordinatorCard
        v-for="coordenador in coordenadores"
        :key="coordenador.id"
        :coordenador="coordenador"
        @selecionar="selecionar"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '@/modules/appointment/store/createFlow'
import CoordinatorCard from '@/modules/appointment/model/CoordinatorCard.vue'

const router = useRouter()
const fluxo = useCreateFlowStore()
const { coordenadores, carregandoCoordenadores, erroCoordenadores } = storeToRefs(fluxo)

onMounted(() => {
  fluxo.carregarCoordenadores().catch(() => {
    // O erro já é exposto por erroCoordenadores.
  })
})

function recarregar() {
  fluxo.carregarCoordenadores(true).catch(() => {})
}

async function selecionar(coordenador) {
  await fluxo.selecionarCoordenador(coordenador)
  router.push({ name: 'criar-horarios' })
}

function voltarParaFaq() {
  router.push({ name: 'criar-faq' })
}
</script>

<style scoped>
.coordenadores {
  max-width: 100%;
}

.coordenadores-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.coordenadores-titulo {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.coordenadores-texto {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
  max-width: 640px;
}

.btn-etapa-anterior {
  padding: 8px 16px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  color: var(--ser-gray-700, #374569);
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.18s;
  white-space: nowrap;
}

.btn-etapa-anterior:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Grade de cards ── */
.coordenadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* ── Estados ── */
.estado-info {
  margin: 0;
  padding: 28px 22px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--color-border, #dde3ef);
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.9rem;
  text-align: center;
}

.estado-erro {
  padding: 24px;
  background: rgba(200, 16, 46, 0.06);
  border: 1px solid rgba(200, 16, 46, 0.25);
  border-radius: var(--radius-lg, 12px);
  text-align: center;
}

.estado-erro-texto {
  margin: 0 0 12px;
  color: var(--ser-red, #c8102e);
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-tentar {
  padding: 9px 20px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--ser-navy, #003087);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.btn-tentar:hover {
  background: var(--ser-navy-light, #0045b5);
}

@media (max-width: 560px) {
  .coordenadores-grid {
    grid-template-columns: 1fr;
  }
}
</style>
