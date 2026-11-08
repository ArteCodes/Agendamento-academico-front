<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth'
import { useScheduleStore, somarMinutos, paraMinutos } from '@/modules/schedule/store/schedule'
import WeekGrid from '@/modules/schedule/model/WeekGrid.vue'
import ModalHorario from '@/modules/schedule/model/ModalHorario.vue'
import ModalSair from '@/modules/schedule/model/ModalSair.vue'

const router = useRouter()
const authStore = useAuthStore()
const scheduleStore = useScheduleStore()
const { user, userName, cargaHorariaSemanal } = storeToRefs(authStore)

const DIAS = [
  { valor: 1, nome: 'Segunda' },
  { valor: 2, nome: 'Terça' },
  { valor: 3, nome: 'Quarta' },
  { valor: 4, nome: 'Quinta' },
  { valor: 5, nome: 'Sexta' },
  { valor: 6, nome: 'Sábado' },
  { valor: 0, nome: 'Domingo' }
]
const nomeDiaPorValor = (v) => DIAS.find((d) => d.valor === v)?.nome || ''
const coordId = computed(() => user.value?.id ?? null)
const metaHoras = computed(() => Number(cargaHorariaSemanal.value) || 20)
const metaMin = computed(() => metaHoras.value * 60)
const rascunho = ref([])
let seqTemp = 1
const salvosDoCoord = computed(() => scheduleStore.porCoordenador(coordId.value))
const minSalvos = computed(() => scheduleStore.totalMinSalvos(coordId.value))
const minRascunho = computed(() => rascunho.value.reduce((a, r) => a + Number(r.duracao_min || 0), 0))
const minTotal = computed(() => minSalvos.value + minRascunho.value)
const metaConcluida = computed(() => minTotal.value >= metaMin.value)
const formatarHoras = (min) => (Math.round((Number(min) / 60) * 100) / 100).toString().replace('.', ',')
const horasSalvasFmt = computed(() => formatarHoras(minSalvos.value))
const horasTotaisFmt = computed(() => formatarHoras(minTotal.value))
const faltamFmt = computed(() => formatarHoras(Math.max(metaMin.value - minTotal.value, 0)))
const percentual = computed(() => (metaMin.value === 0 ? 0 : Math.min(100, Math.round((minTotal.value / metaMin.value) * 100))))
const porDia = computed(() => {
  const mapa = {}
  DIAS.forEach((d) => { mapa[d.valor] = [] })
  salvosDoCoord.value.forEach((s) => { if (mapa[s.dia_semana] != null) mapa[s.dia_semana].push({ ...s, origem: 'salvo' }) })
  rascunho.value.forEach((r) => { if (mapa[r.dia_semana] != null) mapa[r.dia_semana].push({ ...r, origem: 'rascunho' }) })
  Object.keys(mapa).forEach((k) => { mapa[k].sort((a, b) => paraMinutos(a.hora_inicio) - paraMinutos(b.hora_inicio)) })
  return mapa
})
const modalDia = ref(null)
const abrirModal = (diaValor) => { modalDia.value = diaValor }
const fecharModal = () => { modalDia.value = null }
const erroGrade = ref('')
function temChoque(dia, inicio, duracao) {
  const ini = paraMinutos(inicio)
  const fim = ini + Number(duracao)
  return (porDia.value[dia] || []).some((h) => {
    const hIni = paraMinutos(h.hora_inicio)
    const hFim = hIni + Number(h.duracao_min)
    return ini < hFim && fim > hIni
  })
}
function adicionarRascunho(payload) {
  erroGrade.value = ''
  if (metaConcluida.value) { erroGrade.value = 'Tempo semanal concluído. Não é possível adicionar mais horários.'; return }
  if (minTotal.value + Number(payload.duracao_min) > metaMin.value) { erroGrade.value = `Limite semanal de ${metaHoras.value}h seria estourado.`; return }
  if (scheduleStore.temSobreposicao(coordId.value, payload.dia_semana, payload.hora_inicio, payload.duracao_min)) { erroGrade.value = 'Choque com horário já salvo neste dia.'; return }
  if (temChoque(payload.dia_semana, payload.hora_inicio, payload.duracao_min)) { erroGrade.value = 'Choque com outro horário deste dia (inclui rascunho).'; return }
  const horaFim = somarMinutos(payload.hora_inicio, Number(payload.duracao_min))
  if (!horaFim) { erroGrade.value = 'Horário inválido.'; return }
  rascunho.value.push({ tempId: seqTemp++, ...payload, hora_fim: horaFim })
  fecharModal()
}
function removerRascunho(item) { rascunho.value = rascunho.value.filter((r) => r.tempId !== item.tempId) }
function removerSalvo(item) { scheduleStore.removerSalvo(item.id, coordId.value) }
function confirmar() {
  erroGrade.value = ''
  if (rascunho.value.length === 0) { erroGrade.value = 'Nenhum horário novo para confirmar.'; return }
  scheduleStore.salvarLote(coordId.value, rascunho.value.map(({ tempId, hora_fim, ...r }) => r))
  rascunho.value = []
}
const precisaAvisar = computed(() => rascunho.value.length > 0 || minSalvos.value < metaMin.value)
const mostrarSair = ref(false)
const rotaPendente = ref(null)
const liberadoParaSair = ref(false)
function tentarSairPara(rota) {
  if (liberadoParaSair.value || !precisaAvisar.value) { liberadoParaSair.value = false; router.push(rota); return }
  rotaPendente.value = rota
  mostrarSair.value = true
}
function confirmarSaida() {
  rascunho.value = []
  mostrarSair.value = false
  liberadoParaSair.value = true
  const destino = rotaPendente.value || '/agendamentos'
  rotaPendente.value = null
  router.push(destino)
}
function continuarEditando() { mostrarSair.value = false; rotaPendente.value = null }
onBeforeRouteLeave((to, from, next) => {
  if (liberadoParaSair.value || !precisaAvisar.value) return next()
  rotaPendente.value = to.fullPath
  mostrarSair.value = true
  next(false)
})
function aoBeforeUnload(e) {
  if (!precisaAvisar.value) return
  e.preventDefault()
  e.returnValue = ''
}
onMounted(() => { scheduleStore.carregar(coordId.value); window.addEventListener('beforeunload', aoBeforeUnload) })
onBeforeUnmount(() => { window.removeEventListener('beforeunload', aoBeforeUnload) })
</script>

<template>
  <div class="gestao-horarios">
    <!-- Cabeçalho -->
    <header class="pagina-header">
      <div>
        <h1 class="titulo">Gestão de Horários</h1>
        <p class="subtitulo">Olá, {{ userName }} &mdash; configure seus horários semanais de atendimento</p>
      </div>
      <button type="button" class="btn-voltar" @click="tentarSairPara('/agendamentos')">Voltar</button>
    </header>

    <!-- Indicador de progresso -->
    <section class="indicador">
      <div class="indicador-topo">
        <div class="indicador-texto">
          <span class="indicador-rotulo">Carga semanal</span>
          <span class="indicador-valor">{{ horasTotaisFmt }}h <span class="indicador-meta">/ {{ metaHoras }}h</span></span>
        </div>
        <div class="indicador-status">
          <span v-if="!metaConcluida" class="indicador-falta">Faltam {{ faltamFmt }}h</span>
          <span v-else class="indicador-ok">Carga semanal concluída</span>
        </div>
      </div>
      <div class="barra">
        <div class="barra-preenchida" :style="{ width: percentual + '%' }"></div>
      </div>
      <div class="indicador-detalhe">
        <span>Salvo: <strong>{{ horasSalvasFmt }}h</strong></span>
        <span>Rascunho: <strong>{{ formatarHoras(minRascunho) }}h</strong> ({{ rascunho.length }} item{{ rascunho.length !== 1 ? 's' : '' }})</span>
      </div>
    </section>

    <!-- Erro de grade -->
    <p v-if="erroGrade" class="erro-grade">{{ erroGrade }}</p>

    <!-- Grade semanal -->
    <WeekGrid
      :dias="DIAS"
      :por-dia="porDia"
      :meta-concluida="metaConcluida"
      @adicionar="abrirModal"
      @remover-rascunho="removerRascunho"
      @remover-salvo="removerSalvo"
    />

    <!-- Ações -->
    <footer class="acoes-finais">
      <button
        type="button"
        class="btn-confirmar"
        :disabled="rascunho.length === 0"
        @click="confirmar"
      >
        Confirmar e salvar ({{ rascunho.length }} item{{ rascunho.length !== 1 ? 's' : '' }})
      </button>
      <p class="ajuda">Sem confirmar, recarregar ou sair descarta os novos horários.</p>
    </footer>

    <ModalHorario
      v-if="modalDia !== null"
      :dia-semana="modalDia"
      :nome-dia="nomeDiaPorValor(modalDia)"
      @fechar="fecharModal"
      @adicionar="adicionarRascunho"
    />
    <ModalSair
      v-if="mostrarSair"
      :horas-salvas="horasSalvasFmt"
      :meta-horas="metaHoras"
      :qtd-rascunho="rascunho.length"
      @sair="confirmarSaida"
      @continuar="continuarEditando"
    />
  </div>
</template>

<style scoped>
.gestao-horarios {
  max-width: 1300px;
  margin: 0 auto;
  padding: 32px 24px;
  color: var(--color-text, #0d1b3e);
}

/* ── Cabeçalho ── */
.pagina-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
  flex-wrap: wrap;
}

.titulo {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.02em;
}

.subtitulo {
  margin: 4px 0 0;
  color: #1e3a8a;
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-voltar {
  padding: 8px 18px;
  border: 1.5px solid var(--color-border, #dde3ef);
  background: var(--ser-white, #fff);
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--ser-gray-700, #374569);
  font-weight: 500;
  font-size: 0.875rem;
  font-family: inherit;
  transition: background 0.18s;
  white-space: nowrap;
}

.btn-voltar:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Indicador de progresso ── */
.indicador {
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-lg, 12px);
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.indicador-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.indicador-texto {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.indicador-rotulo {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ser-gray-500, #6b7a99);
  font-weight: 600;
}

.indicador-valor {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.indicador-meta {
  font-size: 1rem;
  font-weight: 400;
  color: var(--ser-gray-500, #6b7a99);
}

.indicador-falta {
  color: #b45309;
  font-weight: 600;
  font-size: 0.9rem;
}

.indicador-ok {
  color: var(--color-success, #0a7a4a);
  font-weight: 700;
  font-size: 0.9rem;
}

.barra {
  height: 8px;
  background: var(--ser-gray-100, #eef1f7);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.barra-preenchida {
  height: 100%;
  background: linear-gradient(90deg, #003087, #0045b5);
  transition: width 0.3s ease;
  border-radius: 8px;
}

.indicador-detalhe {
  display: flex;
  gap: 20px;
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.8125rem;
  flex-wrap: wrap;
}

/* ── Erro ── */
.erro-grade {
  background: rgba(200, 16, 46, 0.06);
  border: 1px solid rgba(200, 16, 46, 0.2);
  color: var(--ser-red, #C8102E);
  border-radius: var(--radius-md, 8px);
  padding: 12px 16px;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

/* ── Ações finais ── */
.acoes-finais {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.btn-confirmar {
  padding: 12px 28px;
  background: var(--color-success, #0a7a4a);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.18s;
  font-family: inherit;
}

.btn-confirmar:hover:not(:disabled) {
  background: #086040;
}

.btn-confirmar:disabled {
  background: var(--ser-gray-200, #dde3ef);
  color: var(--ser-gray-500, #6b7a99);
  cursor: not-allowed;
}

.ajuda {
  margin: 0;
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.8125rem;
}
</style>
