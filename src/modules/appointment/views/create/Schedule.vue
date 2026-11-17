<template>
  <section class="horarios">
    <div class="horarios-topo">
      <div>
        <h2 class="horarios-titulo">Escolha um horário</h2>
        <p class="horarios-texto">
          Atendimento com <strong>{{ fluxo.coordenador?.nome }}</strong>. Selecione um dia e um
          horário livre — a reserva é mantida por {{ tempoReserva }} minutos.
        </p>
      </div>

      <div class="horarios-acoes">
        <button
          type="button"
          class="btn-secundario"
          :disabled="carregandoHorarios"
          @click="atualizar"
        >
          {{ carregandoHorarios ? 'Atualizando...' : 'Atualizar horários' }}
        </button>
        <button type="button" class="btn-secundario" @click="voltarParaCoordenadores">
          ← Trocar coordenador
        </button>
      </div>
    </div>

    <p v-if="fluxo.temBloqueio && tempoRestante" class="badge-reserva">
      Horário reservado para você · expira em {{ tempoRestante }}
    </p>

    <p v-if="erro" class="erro-ocupado" role="alert">{{ erro }}</p>
    <p v-else-if="erroHorarios" class="erro-carregamento" role="alert">{{ erroHorarios }}</p>

    <!-- Header com os próximos dias -->
    <nav v-if="dias.length" class="dias" aria-label="Próximos dias">
      <button
        v-for="dia in dias"
        :key="dia.data"
        type="button"
        class="dia"
        :class="{ 'dia--ativo': dia.data === diaSelecionado }"
        :aria-pressed="dia.data === diaSelecionado"
        @click="selecionarDia(dia.data)"
      >
        <span class="dia-semana">{{ rotuloDia(dia.dia_semana) }}</span>
        <span class="dia-data">{{ formatarData(dia.data) }}</span>
        <span class="dia-quantidade">{{ quantidadeLivres(dia) }} livre(s)</span>
      </button>
    </nav>

    <!-- Horários do dia selecionado -->
    <div v-if="dias.length" class="dia-conteudo">
      <h3 class="dia-titulo">{{ formatarDataLonga(diaSelecionado) }}</h3>

      <p v-if="!slotsDoDia.length" class="estado-vazio">
        Nenhum horário disponível para este dia.
      </p>

      <div v-else class="slots">
        <button
          v-for="slot in slotsDoDia"
          :key="slot.horario"
          type="button"
          class="slot"
          :class="classeSlot(slot)"
          :aria-label="`${slot.horario} às ${slot.hora_fim} — ${rotuloStatus(slot)}`"
          @click="escolherSlot(slot)"
        >
          <span class="slot-horario">{{ slot.horario }} – {{ slot.hora_fim }}</span>
          <span class="slot-tipo">{{ slot.tipo }}</span>
          <span class="slot-status">{{ rotuloStatus(slot) }}</span>
        </button>
      </div>

      <p class="legenda">
        <span class="legenda-item"><span class="legenda-cor legenda-cor--livre"></span> Livre</span>
        <span class="legenda-item"><span class="legenda-cor legenda-cor--ocupado"></span> Ocupado</span>
        <span class="legenda-item"><span class="legenda-cor legenda-cor--bloqueado"></span> Indisponível</span>
        <span class="legenda-item"><span class="legenda-cor legenda-cor--meu"></span> Reservado por você</span>
      </p>
    </div>

    <p v-else-if="!carregandoHorarios" class="estado-vazio">
      Nenhum horário cadastrado para este coordenador.
    </p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '@/modules/appointment/store/createFlow'
import { MENSAGEM_HORARIO_OCUPADO } from '@/modules/appointment/data/mensagens'
import { parseDateLocal } from '@/utils/date'

const router = useRouter()
const fluxo = useCreateFlowStore()
const { dias, diaSelecionado, carregandoHorarios, erroHorarios, bloqueando } =
  storeToRefs(fluxo)

const erro = ref('')
const agora = ref(Date.now())
let relogio = null

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const tempoReserva = computed(() => fluxo.ttlMin || 10)

const diaSelecionadoObj = computed(
  () => dias.value.find((dia) => dia.data === diaSelecionado.value) || null
)
const slotsDoDia = computed(() => diaSelecionadoObj.value?.slots || [])

const segundosRestantes = computed(() => {
  const expiraEm = fluxo.bloqueio?.expiraEm
  if (!expiraEm) return null
  return Math.max(0, Math.floor((Date.parse(expiraEm) - agora.value) / 1000))
})

const tempoRestante = computed(() => {
  const segundos = segundosRestantes.value
  if (segundos == null) return ''
  const minutos = Math.floor(segundos / 60)
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
})

function rotuloDia(diaSemana) {
  return DIAS_CURTOS[diaSemana] || ''
}

function formatarData(dataStr) {
  const data = parseDateLocal(dataStr)
  if (!data) return dataStr
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatarDataLonga(dataStr) {
  const data = parseDateLocal(dataStr)
  if (!data) return ''
  const texto = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function quantidadeLivres(dia) {
  return dia.slots.filter(
    (slot) => slot.status === 'livre' || slot.status === 'bloqueado_por_mim'
  ).length
}

function rotuloStatus(slot) {
  if (slot.status === 'livre') return 'Livre'
  if (slot.status === 'ocupado') return 'Ocupado'
  if (slot.status === 'bloqueado_por_mim') return 'Reservado por você'
  return 'Indisponível'
}

function classeSlot(slot) {
  return {
    'slot--livre': slot.status === 'livre',
    'slot--ocupado': slot.status === 'ocupado',
    'slot--bloqueado': slot.status === 'bloqueado',
    'slot--meu': slot.status === 'bloqueado_por_mim',
  }
}

function selecionarDia(data) {
  erro.value = ''
  fluxo.selecionarDia(data)
}

async function atualizar(opcoes = {}) {
  if (!opcoes.silencioso) erro.value = ''
  try {
    await fluxo.carregarHorarios()
  } catch {
    // O erro de carregamento já é exposto por erroHorarios.
  }
}

async function escolherSlot(slot) {
  if (bloqueando.value) return

  erro.value = ''

  if (slot.status === 'ocupado' || slot.status === 'bloqueado') {
    erro.value = MENSAGEM_HORARIO_OCUPADO
    return
  }

  if (slot.status === 'bloqueado_por_mim') {
    fluxo.diaSelecionado = diaSelecionado.value
    fluxo.slot = slot
    router.push({ name: 'criar-formulario' })
    return
  }

  try {
    await fluxo.bloquearHorario(diaSelecionado.value, slot)
    router.push({ name: 'criar-formulario' })
  } catch (falha) {
    if (falha?.response?.status === 409) {
      erro.value = falha.response.data?.detail || MENSAGEM_HORARIO_OCUPADO
    } else {
      erro.value = 'Não foi possível reservar este horário. Tente novamente.'
    }
    // Reflete no ecrã o estado real do slot (pode ter sido ocupado por outro usuário).
    await atualizar({ silencioso: true })
  }
}

async function voltarParaCoordenadores() {
  // Voltar um passo na Tela de Horários libera o bloqueio temporário.
  await fluxo.liberarBloqueio()
  fluxo.limparHorario()
  router.push({ name: 'criar-coordenadores' })
}

function iniciarRelogio() {
  pararRelogio()
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (segundosRestantes.value === 0 && fluxo.bloqueio) {
      fluxo.descartarBloqueioExpirado()
      erro.value = 'Sua reserva expirou. Escolha um horário novamente.'
      atualizar({ silencioso: true })
    }
  }, 1000)
}

function pararRelogio() {
  if (relogio) {
    clearInterval(relogio)
    relogio = null
  }
}

onMounted(async () => {
  if (!fluxo.coordenador) {
    router.replace({ name: 'criar-coordenadores' })
    return
  }

  await atualizar()
  iniciarRelogio()
})

onBeforeUnmount(pararRelogio)
</script>

<style scoped>
.horarios-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.horarios-titulo {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.horarios-texto {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
  max-width: 640px;
}

.horarios-acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-secundario {
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

.btn-secundario:hover:not(:disabled) {
  background: var(--ser-gray-100, #eef1f7);
}

.btn-secundario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.badge-reserva {
  display: inline-block;
  margin: 0 0 16px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(0, 48, 135, 0.08);
  color: var(--ser-navy, #003087);
  font-size: 0.8125rem;
  font-weight: 700;
}

/* ── Mensagens ── */
.erro-ocupado,
.erro-carregamento {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 500;
}

.erro-ocupado {
  border: 1px solid rgba(200, 16, 46, 0.3);
  background: rgba(200, 16, 46, 0.07);
  color: var(--ser-red, #c8102e);
}

.erro-carregamento {
  border: 1px solid rgba(180, 83, 9, 0.3);
  background: rgba(180, 83, 9, 0.07);
  color: var(--color-warning, #b45309);
}

/* ── Header de dias ── */
.dias {
  display: grid;
  grid-template-columns: repeat(7, minmax(88px, 1fr));
  gap: 10px;
  padding: 12px;
  margin-bottom: 20px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
  overflow-x: auto;
}

.dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  min-width: 0;
}

.dia:hover {
  border-color: var(--ser-navy-light, #0045b5);
}

.dia--ativo {
  border-color: var(--ser-navy, #003087);
  background: var(--ser-navy, #003087);
}

.dia-semana {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ser-gray-500, #6b7a99);
}

.dia-data {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ser-gray-900, #0d1b3e);
}

.dia-quantidade {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--ser-gray-500, #6b7a99);
  white-space: nowrap;
}

.dia--ativo .dia-semana,
.dia--ativo .dia-data,
.dia--ativo .dia-quantidade {
  color: #fff;
}

/* ── Slots ── */
.dia-conteudo {
  padding: 22px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.dia-titulo {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ser-gray-900, #0d1b3e);
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.18s;
}

.slot-horario {
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--ser-gray-900, #0d1b3e);
}

.slot-tipo {
  font-size: 0.75rem;
  color: var(--ser-gray-500, #6b7a99);
}

.slot-status {
  margin-top: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Livre */
.slot--livre {
  border-color: rgba(10, 122, 74, 0.35);
}

.slot--livre:hover {
  border-color: var(--color-success, #0a7a4a);
  background: rgba(10, 122, 74, 0.05);
  transform: translateY(-2px);
}

.slot--livre .slot-status {
  color: var(--color-success, #0a7a4a);
}

/* Ocupado: permanece visível, mas não pode ser selecionado. */
.slot--ocupado {
  border-color: rgba(200, 16, 46, 0.3);
  background: rgba(200, 16, 46, 0.05);
  cursor: not-allowed;
}

.slot--ocupado .slot-horario,
.slot--ocupado .slot-tipo {
  color: var(--ser-gray-500, #6b7a99);
}

.slot--ocupado .slot-status {
  color: var(--ser-red, #c8102e);
}

/* Bloqueado por outro usuário. */
.slot--bloqueado {
  border-color: var(--color-border, #dde3ef);
  background: var(--ser-gray-100, #eef1f7);
  cursor: not-allowed;
}

.slot--bloqueado .slot-horario,
.slot--bloqueado .slot-tipo {
  color: var(--ser-gray-500, #6b7a99);
}

.slot--bloqueado .slot-status {
  color: var(--ser-gray-500, #6b7a99);
}

/* Reservado pelo próprio usuário. */
.slot--meu {
  border-color: var(--ser-navy, #003087);
  background: rgba(0, 48, 135, 0.07);
}

.slot--meu .slot-status {
  color: var(--ser-navy, #003087);
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 18px 0 0;
  font-size: 0.75rem;
  color: var(--ser-gray-500, #6b7a99);
}

.legenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legenda-cor {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1.5px solid var(--color-border, #dde3ef);
}

.legenda-cor--livre {
  border-color: rgba(10, 122, 74, 0.5);
  background: rgba(10, 122, 74, 0.12);
}

.legenda-cor--ocupado {
  border-color: rgba(200, 16, 46, 0.45);
  background: rgba(200, 16, 46, 0.12);
}

.legenda-cor--bloqueado {
  background: var(--ser-gray-200, #dde3ef);
}

.legenda-cor--meu {
  border-color: var(--ser-navy, #003087);
  background: rgba(0, 48, 135, 0.15);
}

.estado-vazio {
  margin: 0;
  padding: 18px;
  border-radius: var(--radius-md, 8px);
  background: var(--ser-gray-50, #f7f9fc);
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 720px) {
  .dias {
    grid-template-columns: repeat(7, minmax(74px, 1fr));
  }

  .dia-quantidade {
    display: none;
  }
}
</style>
