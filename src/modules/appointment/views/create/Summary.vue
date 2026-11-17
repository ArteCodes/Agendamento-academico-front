<template>
  <section class="resumo">
    <!-- ── Confirmação concluída ── -->
    <div v-if="confirmado" class="sucesso">
      <div class="sucesso-icone" aria-hidden="true">✓</div>
      <h2 class="sucesso-titulo">Agendamento solicitado!</h2>
      <p class="sucesso-texto">
        Sua solicitação foi registrada com status
        <strong>{{ confirmado.agendamento?.status || 'Pendente' }}</strong> e aguarda a
        confirmação do coordenador.
      </p>

      <div class="sucesso-detalhes">
        <p class="detalhe-linha">
          <span class="detalhe-rotulo">Coordenador</span>
          <span class="detalhe-valor">{{ confirmado.coordenador?.nome }}</span>
        </p>
        <p class="detalhe-linha">
          <span class="detalhe-rotulo">Data e horário</span>
          <span class="detalhe-valor">
            {{ formatarData(confirmado.data) }} · {{ confirmado.slot?.horario }} –
            {{ confirmado.slot?.hora_fim }}
          </span>
        </p>
        <p class="detalhe-linha">
          <span class="detalhe-rotulo">Agendante</span>
          <span class="detalhe-valor">{{ confirmado.formulario?.nome }}</span>
        </p>
        <p v-if="confirmado.agendamento?.id" class="detalhe-linha">
          <span class="detalhe-rotulo">Protocolo</span>
          <span class="detalhe-valor">#{{ confirmado.agendamento.id }}</span>
        </p>
      </div>

      <div class="sucesso-acoes">
        <button type="button" class="btn-secundario" @click="irParaLista">
          Ver meus agendamentos
        </button>
        <button type="button" class="btn-primario" @click="novoAgendamento">
          Fazer novo agendamento
        </button>
      </div>
    </div>

    <!-- ── Resumo para confirmação ── -->
    <template v-else>
      <div class="resumo-topo">
        <div>
          <h2 class="resumo-titulo">Resumo do agendamento</h2>
          <p class="resumo-texto">
            Confira os dados abaixo. O agendamento só é enviado ao clicar em
            <strong>Solicitar agendamento</strong>.
          </p>
        </div>
        <button type="button" class="btn-secundario" @click="voltarAoFormulario">
          ← Editar dados
        </button>
      </div>

      <p v-if="erro" class="erro-ocupado" role="alert">{{ erro }}</p>

      <div class="resumo-grid">
        <div class="resumo-card-coordenador">
          <CoordinatorCard :coordenador="fluxo.coordenador" :selecionavel="false" />
        </div>

        <div class="resumo-detalhes">
          <div class="reserva-topo">
            <div>
              <p class="reserva-rotulo">Data e horário</p>
              <p class="reserva-data">{{ formatarData(fluxo.diaSelecionado) }}</p>
              <p class="reserva-hora">
                {{ fluxo.slot?.horario }} – {{ fluxo.slot?.hora_fim }}
                <span v-if="fluxo.slot?.tipo" class="reserva-tipo">{{ fluxo.slot.tipo }}</span>
              </p>
            </div>
            <span v-if="tempoRestante" class="reserva-ttl">
              reserva expira em <strong>{{ tempoRestante }}</strong>
            </span>
            <span v-else class="reserva-ttl reserva-ttl--expirada">reserva expirada</span>
          </div>

          <dl class="dados">
            <div v-for="campo in camposExibidos" :key="campo.chave" class="dado">
              <dt class="dado-rotulo">{{ campo.rotulo }}</dt>
              <dd class="dado-valor" :class="{ 'dado-valor--texto': campo.chave === 'descricao' }">
                {{ dados[campo.chave] || '—' }}
              </dd>
            </div>
          </dl>

          <div class="resumo-acoes">
            <button
              type="button"
              class="btn-secundario"
              :disabled="salvando"
              @click="voltarAosHorarios"
            >
              Escolher outro horário
            </button>
            <button
              type="button"
              class="btn-primario"
              :disabled="salvando || !podeConfirmar"
              @click="solicitar"
            >
              {{ salvando ? 'Enviando...' : 'Solicitar agendamento' }}
            </button>
          </div>

          <p class="resumo-nota">
            Ao solicitar, o horário reservado é convertido em um agendamento pendente. O
            bloqueio temporário deixa de existir.
          </p>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '@/modules/appointment/store/createFlow'
import CoordinatorCard from '@/modules/appointment/model/CoordinatorCard.vue'
import { MENSAGEM_HORARIO_OCUPADO } from '@/modules/appointment/data/mensagens'
import { parseDateLocal } from '@/utils/date'

const router = useRouter()
const fluxo = useCreateFlowStore()

const erro = ref('')
const confirmado = ref(null)
const agora = ref(Date.now())
let relogio = null

const camposExibidos = [
  { chave: 'nome', rotulo: 'Nome do agendante' },
  { chave: 'matricula', rotulo: 'Matrícula' },
  { chave: 'curso', rotulo: 'Curso' },
  { chave: 'periodo', rotulo: 'Período' },
  { chave: 'turma', rotulo: 'Turma' },
  { chave: 'telefone', rotulo: 'Telefone' },
  { chave: 'email', rotulo: 'E-mail' },
  { chave: 'descricao', rotulo: 'Descrição' },
]

const dados = computed(() => fluxo.formulario || {})
const salvando = computed(() => fluxo.salvando)
const podeConfirmar = computed(() => Boolean(fluxo.bloqueio?.token))

const segundosRestantes = computed(() => {
  const expiraEm = fluxo.bloqueio?.expiraEm
  if (!expiraEm) return null
  return Math.max(0, Math.floor((Date.parse(expiraEm) - agora.value) / 1000))
})

const tempoRestante = computed(() => {
  const segundos = segundosRestantes.value
  if (segundos == null || segundos <= 0) return ''
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
})

function formatarData(dataStr) {
  const data = parseDateLocal(dataStr)
  if (!data) return ''
  const texto = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

async function solicitar() {
  if (salvando.value || !podeConfirmar.value) return
  erro.value = ''

  // Snapshot para a tela de sucesso (o estado do fluxo é zerado depois).
  const snapshot = {
    coordenador: fluxo.coordenador,
    data: fluxo.diaSelecionado,
    slot: fluxo.slot ? { ...fluxo.slot } : null,
    formulario: { ...(fluxo.formulario || {}) },
  }

  try {
    const agendamento = await fluxo.confirmarAgendamento()
    confirmado.value = { ...snapshot, agendamento }
    pararRelogio()
    // Nunca libera o bloqueio após salvar: o servidor já o consumiu.
    fluxo.finalizarFluxo()
  } catch (falha) {
    if (falha?.response?.status === 409) {
      erro.value = falha.response.data?.detail || MENSAGEM_HORARIO_OCUPADO
      // O bloqueio não é mais válido: libera o estado local sem chamar DELETE.
      fluxo.bloqueio = null
      fluxo.slot = null
    } else {
      erro.value = 'Não foi possível concluir o agendamento. Tente novamente.'
      console.error('Erro ao confirmar agendamento:', falha)
    }
  }
}

function voltarAoFormulario() {
  router.push({ name: 'criar-formulario' })
}

async function voltarAosHorarios() {
  await fluxo.liberarBloqueio()
  fluxo.limparHorario()
  router.push({ name: 'criar-horarios' })
}

function irParaLista() {
  router.push({ name: 'agendamentos' })
}

function novoAgendamento() {
  router.push({ name: 'criar-faq' })
}

function iniciarRelogio() {
  pararRelogio()
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (!fluxo.bloqueio) return
    if (segundosRestantes.value === 0) {
      fluxo.descartarBloqueioExpirado()
      erro.value = 'Sua reserva expirou. Escolha um horário novamente.'
      pararRelogio()
    }
  }, 1000)
}

function pararRelogio() {
  if (relogio) {
    clearInterval(relogio)
    relogio = null
  }
}

onMounted(() => {
  if (!fluxo.coordenador) {
    router.replace({ name: 'criar-coordenadores' })
    return
  }
  if (!fluxo.formulario) {
    router.replace({ name: 'criar-formulario' })
    return
  }
  if (!fluxo.bloqueio?.token) {
    router.replace({ name: 'criar-horarios' })
    return
  }

  iniciarRelogio()
})

onBeforeUnmount(pararRelogio)
</script>

<style scoped>
.resumo-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.resumo-titulo {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.resumo-texto {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
  max-width: 620px;
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

.btn-primario {
  padding: 12px 28px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: linear-gradient(135deg, #003087 0%, #001f5a 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.18s, box-shadow 0.18s;
}

.btn-primario:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 4px 14px rgba(0, 48, 135, 0.25);
}

.btn-primario:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Erro ── */
.erro-ocupado {
  margin: 0 0 16px;
  padding: 12px 16px;
  border: 1px solid rgba(200, 16, 46, 0.3);
  border-radius: var(--radius-md, 8px);
  background: rgba(200, 16, 46, 0.07);
  color: var(--ser-red, #c8102e);
  font-size: 0.875rem;
  font-weight: 500;
}

/* ── Grade ── */
.resumo-grid {
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  gap: 24px;
  align-items: start;
}

.resumo-card-coordenador {
  max-width: 300px;
}

.resumo-detalhes {
  padding: 24px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

/* ── Reserva ── */
.reserva-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--color-border, #dde3ef);
}

.reserva-rotulo {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ser-gray-500, #6b7a99);
}

.reserva-data {
  margin: 4px 0 0;
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.reserva-hora {
  margin: 2px 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ser-gray-700, #374569);
}

.reserva-tipo {
  margin-left: 8px;
  font-weight: 500;
  color: var(--ser-gray-500, #6b7a99);
}

.reserva-ttl {
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(10, 122, 74, 0.08);
  color: var(--color-success, #0a7a4a);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.reserva-ttl--expirada {
  background: rgba(200, 16, 46, 0.08);
  color: var(--ser-red, #c8102e);
}

/* ── Dados ── */
.dados {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin: 0 0 24px;
}

.dado {
  min-width: 0;
}

.dado-rotulo {
  margin: 0 0 3px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ser-gray-500, #6b7a99);
}

.dado-valor {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ser-gray-900, #0d1b3e);
  overflow-wrap: anywhere;
}

.dado:nth-child(8) {
  grid-column: 1 / -1;
}

.dado-valor--texto {
  font-weight: 400;
  line-height: 1.6;
  white-space: pre-line;
}

/* ── Ações ── */
.resumo-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.resumo-nota {
  margin: 16px 0 0;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--ser-gray-500, #6b7a99);
}

/* ── Sucesso ── */
.sucesso {
  max-width: 620px;
  margin: 0 auto;
  padding: 40px 28px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
  text-align: center;
}

.sucesso-icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: rgba(10, 122, 74, 0.12);
  color: var(--color-success, #0a7a4a);
  font-size: 1.75rem;
  font-weight: 800;
}

.sucesso-titulo {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.sucesso-texto {
  margin: 0 auto 24px;
  max-width: 460px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--ser-gray-700, #374569);
}

.sucesso-detalhes {
  padding: 18px 20px;
  margin-bottom: 24px;
  border-radius: var(--radius-md, 8px);
  background: var(--ser-gray-50, #f7f9fc);
  text-align: left;
}

.detalhe-linha {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 6px 0;
}

.detalhe-linha + .detalhe-linha {
  border-top: 1px solid var(--color-border, #dde3ef);
}

.detalhe-rotulo {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ser-gray-500, #6b7a99);
}

.detalhe-valor {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ser-gray-900, #0d1b3e);
  text-align: right;
}

.sucesso-acoes {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .resumo-grid {
    grid-template-columns: 1fr;
  }

  .resumo-card-coordenador {
    max-width: 280px;
  }

  .dados {
    grid-template-columns: 1fr;
  }

  .resumo-acoes {
    flex-direction: column-reverse;
  }

  .resumo-acoes > button {
    width: 100%;
  }
}
</style>
