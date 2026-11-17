<template>
  <section class="formulario">
    <div class="formulario-topo">
      <div>
        <h2 class="formulario-titulo">Seus dados</h2>
        <p class="formulario-texto">
          Confira o horário reservado e complete as informações do agendamento.
        </p>
      </div>
      <button type="button" class="btn-secundario" @click="voltarAosHorarios">
        ← Trocar horário
      </button>
    </div>

    <!-- Resumo compacto da reserva (o bloqueio continua ativo nesta tela) -->
    <div class="reserva-faixa">
      <div class="reserva-info">
        <span class="reserva-rotulo">Horário reservado</span>
        <span class="reserva-valor">
          {{ resumoData }} · {{ fluxo.slot?.horario }} – {{ fluxo.slot?.hora_fim }}
        </span>
        <span class="reserva-coordenador">com {{ fluxo.coordenador?.nome }}</span>
      </div>
      <span v-if="tempoRestante" class="reserva-ttl">
        expira em <strong>{{ tempoRestante }}</strong>
      </span>
      <span v-else class="reserva-ttl reserva-ttl--expirada">reserva expirada</span>
    </div>

    <p v-if="fluxo.erroPerfil" class="estado-erro" role="alert">
      {{ fluxo.erroPerfil }}
    </p>

    <p v-else-if="!pronto" class="estado-info">Carregando seus dados...</p>

    <form v-else class="form-card" novalidate @submit.prevent="continuar">
      <div class="form-grid">
        <div class="campo campo--full">
          <label for="nome" class="campo-label">
            Nome do agendante
            <span v-if="travado('nome')" class="campo-trava">preenchido automaticamente</span>
          </label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="input"
            :class="{ 'input--travado': travado('nome'), 'input--erro': erros.nome }"
            :readonly="travado('nome')"
            :aria-readonly="travado('nome')"
            autocomplete="name"
            maxlength="200"
            placeholder="Nome completo de quem vai ser atendido"
          />
          <p v-if="erros.nome" class="campo-erro">{{ erros.nome }}</p>
        </div>

        <div class="campo">
          <label for="matricula" class="campo-label">
            Matrícula
            <span v-if="travado('matricula')" class="campo-trava">preenchido automaticamente</span>
          </label>
          <input
            id="matricula"
            v-model="form.matricula"
            type="text"
            class="input"
            :class="{ 'input--travado': travado('matricula'), 'input--erro': erros.matricula }"
            :readonly="travado('matricula')"
            :aria-readonly="travado('matricula')"
            maxlength="60"
            placeholder="Matrícula do aluno"
          />
          <p v-if="erros.matricula" class="campo-erro">{{ erros.matricula }}</p>
        </div>

        <div class="campo">
          <label for="curso" class="campo-label">
            Curso
            <span v-if="travado('curso')" class="campo-trava">preenchido automaticamente</span>
          </label>
          <input
            id="curso"
            v-model="form.curso"
            type="text"
            class="input"
            :class="{ 'input--travado': travado('curso'), 'input--erro': erros.curso }"
            :readonly="travado('curso')"
            :aria-readonly="travado('curso')"
            maxlength="150"
            placeholder="Curso do aluno"
          />
          <p v-if="erros.curso" class="campo-erro">{{ erros.curso }}</p>
        </div>

        <div class="campo">
          <label for="periodo" class="campo-label">
            Período
            <span v-if="travado('periodo')" class="campo-trava">preenchido automaticamente</span>
          </label>
          <input
            id="periodo"
            v-model="form.periodo"
            type="text"
            class="input"
            :class="{ 'input--travado': travado('periodo'), 'input--erro': erros.periodo }"
            :readonly="travado('periodo')"
            :aria-readonly="travado('periodo')"
            maxlength="60"
            placeholder="Ex: 3º período"
          />
          <p v-if="erros.periodo" class="campo-erro">{{ erros.periodo }}</p>
        </div>

        <div class="campo">
          <label for="turma" class="campo-label">
            Turma
            <span v-if="travado('turma')" class="campo-trava">preenchido automaticamente</span>
          </label>
          <input
            id="turma"
            v-model="form.turma"
            type="text"
            class="input"
            :class="{ 'input--travado': travado('turma'), 'input--erro': erros.turma }"
            :readonly="travado('turma')"
            :aria-readonly="travado('turma')"
            maxlength="60"
            placeholder="Ex: ADS-3A"
          />
          <p v-if="erros.turma" class="campo-erro">{{ erros.turma }}</p>
        </div>

        <div class="campo">
          <label for="telefone" class="campo-label">Telefone</label>
          <input
            id="telefone"
            v-model="form.telefone"
            type="tel"
            class="input"
            :class="{ 'input--erro': erros.telefone }"
            autocomplete="tel"
            maxlength="30"
            placeholder="(81) 99999-9999"
          />
          <p v-if="erros.telefone" class="campo-erro">{{ erros.telefone }}</p>
        </div>

        <div class="campo">
          <label for="email" class="campo-label">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input"
            :class="{ 'input--erro': erros.email }"
            autocomplete="email"
            maxlength="254"
            placeholder="seuemail@exemplo.com"
          />
          <p v-if="erros.email" class="campo-erro">{{ erros.email }}</p>
        </div>

        <div class="campo campo--full">
          <label for="descricao" class="campo-label">Descrição</label>
          <textarea
            id="descricao"
            v-model="form.descricao"
            class="input textarea"
            :class="{ 'input--erro': erros.descricao }"
            rows="4"
            maxlength="2000"
            placeholder="Descreva o motivo do agendamento..."
          ></textarea>
          <p v-if="erros.descricao" class="campo-erro">{{ erros.descricao }}</p>
        </div>
      </div>

      <div class="form-acoes">
        <button type="button" class="btn-secundario" @click="voltarAosHorarios">
          Voltar
        </button>
        <button type="submit" class="btn-primario">Continuar</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '@/modules/appointment/store/createFlow'
import { parseDateLocal } from '@/utils/date'

const router = useRouter()
const fluxo = useCreateFlowStore()

const CAMPOS_FORMULARIO = [
  'nome',
  'matricula',
  'curso',
  'periodo',
  'turma',
  'telefone',
  'email',
  'descricao',
]

// Campos que o aluno não pode editar (vêm do cadastro).
const CAMPOS_TRAVADOS_ALUNO = ['nome', 'matricula', 'curso', 'periodo', 'turma']

const FORM_VAZIO = {
  nome: '',
  matricula: '',
  curso: '',
  periodo: '',
  turma: '',
  telefone: '',
  email: '',
  descricao: '',
}

const form = reactive(construirFormulario(fluxo.formulario, fluxo.perfil))
const erros = reactive({})
const pronto = ref(Boolean(fluxo.perfil))
const agora = ref(Date.now())
let relogio = null

const ehAluno = computed(() => fluxo.perfil?.tipo === 'aluno')

const resumoData = computed(() => formatarData(fluxo.diaSelecionado))

const segundosRestantes = computed(() => {
  const expiraEm = fluxo.bloqueio?.expiraEm
  if (!expiraEm) return null
  return Math.max(0, Math.floor((Date.parse(expiraEm) - agora.value) / 1000))
})

const tempoRestante = computed(() => {
  const segundos = segundosRestantes.value
  if (segundos == null || segundos <= 0) return ''
  const minutos = Math.floor(segundos / 60)
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
})

function construirFormulario(formulario, perfil) {
  if (formulario) return { ...FORM_VAZIO, ...formulario }

  // Não-aluno: formulário todo vazio e editável.
  if (perfil?.tipo !== 'aluno') return { ...FORM_VAZIO }

  // Aluno: dados do cadastro + contato editável.
  return {
    ...FORM_VAZIO,
    nome: perfil.nome || '',
    matricula: perfil.matricula || '',
    curso: perfil.curso || '',
    periodo: perfil.periodo || '',
    turma: perfil.turma || '',
    telefone: perfil.telefone || '',
    email: perfil.email || '',
  }
}

function travado(campo) {
  return ehAluno.value && CAMPOS_TRAVADOS_ALUNO.includes(campo)
}

function formatarData(dataStr) {
  const data = parseDateLocal(dataStr)
  if (!data) return ''
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function validar() {
  Object.keys(erros).forEach((chave) => delete erros[chave])

  const textos = {
    nome: 'Informe o nome do agendante.',
    matricula: 'Informe a matrícula.',
    curso: 'Informe o curso.',
    periodo: 'Informe o período.',
    turma: 'Informe a turma.',
    telefone: 'Informe o telefone.',
    email: 'Informe o e-mail.',
    descricao: 'Descreva o motivo do agendamento.',
  }

  CAMPOS_FORMULARIO.forEach((campo) => {
    if (!String(form[campo] ?? '').trim()) erros[campo] = textos[campo]
  })

  if (!erros.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    erros.email = 'Informe um e-mail válido.'
  }

  if (!erros.telefone && form.telefone.replace(/\D/g, '').length < 8) {
    erros.telefone = 'Informe um telefone válido com DDD.'
  }

  return Object.keys(erros).length === 0
}

function continuar() {
  if (!validar()) {
    nextTick(() => {
      const primeiro = document.querySelector('.input--erro')
      if (primeiro) primeiro.focus()
    })
    return
  }

  fluxo.salvarFormulario({
    nome: form.nome.trim(),
    matricula: form.matricula.trim(),
    curso: form.curso.trim(),
    periodo: form.periodo.trim(),
    turma: form.turma.trim(),
    telefone: form.telefone.trim(),
    email: form.email.trim(),
    descricao: form.descricao.trim(),
  })

  router.push({ name: 'criar-resumo' })
}

function voltarAosHorarios() {
  // Voltar não libera o bloqueio: o usuário pode trocar de horário na tela
  // anterior, onde a troca é tratada explicitamente.
  router.push({ name: 'criar-horarios' })
}

function iniciarRelogio() {
  pararRelogio()
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (segundosRestantes.value === 0 && fluxo.bloqueio) {
      fluxo.descartarBloqueioExpirado()
      router.replace({ name: 'criar-horarios' })
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
  if (!fluxo.bloqueio?.token) {
    router.replace({ name: 'criar-horarios' })
    return
  }

  try {
    const perfil = await fluxo.carregarPerfilAgendante()
    if (!fluxo.formulario) {
      Object.assign(form, construirFormulario(null, perfil))
    }
    pronto.value = Boolean(fluxo.perfil)
  } catch {
    // O erro já é exposto por fluxo.erroPerfil.
  }

  iniciarRelogio()
})

onBeforeUnmount(pararRelogio)
</script>

<style scoped>
.formulario-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.formulario-titulo {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.formulario-texto {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
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

.btn-secundario:hover {
  background: var(--ser-gray-100, #eef1f7);
}

/* ── Faixa da reserva ── */
.reserva-faixa {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-left: 4px solid var(--ser-navy, #003087);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.reserva-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reserva-rotulo {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ser-gray-500, #6b7a99);
}

.reserva-valor {
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.reserva-coordenador {
  font-size: 0.8125rem;
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

/* ── Estados ── */
.estado-info,
.estado-erro {
  margin: 0;
  padding: 22px;
  border-radius: var(--radius-lg, 12px);
  font-size: 0.9rem;
  text-align: center;
}

.estado-info {
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  color: var(--ser-gray-500, #6b7a99);
}

.estado-erro {
  background: rgba(200, 16, 46, 0.06);
  border: 1px solid rgba(200, 16, 46, 0.25);
  color: var(--ser-red, #c8102e);
  font-weight: 500;
}

/* ── Formulário ── */
.form-card {
  padding: 24px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.campo--full {
  grid-column: 1 / -1;
}

.campo-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-700, #374569);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.campo-trava {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 48, 135, 0.08);
  color: var(--ser-navy, #003087);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: none;
}

.input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  font-size: 0.9375rem;
  color: var(--color-text, #0d1b3e);
  background: var(--ser-white, #fff);
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.input:focus {
  border-color: var(--ser-navy, #003087);
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.1);
}

.input::placeholder {
  color: var(--ser-gray-300, #c0cad9);
}

/* Campos automáticos do aluno: leitura apenas. */
.input--travado {
  background: var(--ser-gray-100, #eef1f7);
  color: var(--ser-gray-700, #374569);
  cursor: not-allowed;
}

.input--travado:focus {
  border-color: var(--color-border, #dde3ef);
  box-shadow: none;
}

.input--erro {
  border-color: var(--ser-red, #c8102e);
}

.input--erro:focus {
  box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.12);
}

.textarea {
  resize: vertical;
  min-height: 96px;
}

.campo-erro {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ser-red, #c8102e);
}

/* ── Ações ── */
.form-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
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

.btn-primario:hover {
  opacity: 0.92;
  box-shadow: 0 4px 14px rgba(0, 48, 135, 0.25);
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-acoes {
    flex-direction: column-reverse;
  }

  .form-acoes > button {
    width: 100%;
  }
}
</style>
