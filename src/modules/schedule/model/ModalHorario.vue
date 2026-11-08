<template>
  <div class="modal-backdrop" @click.self="$emit('fechar')">
    <div class="modal-card">
      <header class="modal-cabecalho">
        <h2 class="modal-titulo">Novo Horário &mdash; {{ nomeDia }}</h2>
        <button type="button" class="btn-fechar-icone" @click="$emit('fechar')">&times;</button>
      </header>
      <div class="modal-corpo">
        <div class="form-group">
          <label>Dia da semana</label>
          <!-- Campo não editável: vem fixo do dia clicado -->
          <input class="input" :value="nomeDia" disabled />
        </div>
        <div class="form-linha">
          <div class="form-group">
            <label for="hora-inicio">Hora inicial</label>
            <input id="hora-inicio" v-model="horaInicio" type="time" class="input" required />
          </div>
          <div class="form-group">
            <label for="duracao">Duração</label>
            <select id="duracao" v-model.number="duracaoMin" class="input">
              <option :value="30">30 min</option>
              <option :value="45">45 min</option>
              <option :value="60">1h</option>
              <option :value="90">1h30</option>
              <option :value="120">2h</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="tipo">Tipo de atendimento</label>
          <select id="tipo" v-model="tipo" class="input">
            <option>Atendimento</option>
            <option>Consulta Psicológica</option>
            <option>Orientação Acadêmica</option>
            <option>Atendimento Social</option>
            <option>Consulta Nutricional</option>
            <option>Apoio Psicopedagógico</option>
          </select>
        </div>
        <div class="preview-horario">
          <span class="preview-label">Período:</span>
          <strong>{{ horaInicio || '--:--' }} - {{ horaFim || '--:--' }}</strong>
        </div>
        <p v-if="erro" class="erro">{{ erro }}</p>
      </div>
      <footer class="modal-rodape">
        <button type="button" class="btn-acao btn-fechar-modal" @click="$emit('fechar')">Cancelar</button>
        <button type="button" class="btn-acao btn-adicionar" @click="adicionar">Adicionar ao rascunho</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { somarMinutos } from '@/modules/schedule/store/schedule'

const props = defineProps({
  diaSemana: { type: Number, required: true },
  nomeDia: { type: String, default: '' }
})

const emit = defineEmits(['fechar', 'adicionar'])

const horaInicio = ref('14:00')
const duracaoMin = ref(60)
const tipo = ref('Atendimento')
const erro = ref('')

const horaFim = computed(() => {
  if (!horaInicio.value) return ''
  return somarMinutos(horaInicio.value, Number(duracaoMin.value)) || ''
})

function adicionar() {
  erro.value = ''
  if (!horaInicio.value) {
    erro.value = 'Informe a hora inicial.'
    return
  }
  if (!horaFim.value) {
    erro.value = 'Horário inválido (estoura o dia). Ajuste hora ou duração.'
    return
  }
  emit('adicionar', {
    dia_semana: props.diaSemana,
    hora_inicio: horaInicio.value,
    duracao_min: Number(duracaoMin.value),
    tipo: tipo.value
  })
}
</script>

<style scoped>
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
  max-width: 480px;
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

.modal-corpo {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-700, #374569);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input {
  padding: 11px 14px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  font-size: 0.9375rem;
  color: var(--color-text, #0d1b3e);
  background: var(--ser-white, #fff);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: var(--ser-navy, #003087);
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.10);
}

.input:disabled {
  background: var(--ser-gray-100, #eef1f7);
  color: var(--ser-gray-500, #6b7a99);
}

.preview-horario {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ser-gray-900, #0d1b3e);
  background: rgba(0, 48, 135, 0.05);
  border: 1px solid rgba(0, 48, 135, 0.15);
  border-radius: var(--radius-md, 8px);
  padding: 10px 14px;
  font-size: 0.9rem;
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ser-gray-500, #6b7a99);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.erro {
  margin: 0;
  color: var(--ser-red, #C8102E);
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  background: var(--ser-gray-50, #f7f9fc);
  border-top: 1px solid var(--color-border, #dde3ef);
  flex-wrap: wrap;
}

.btn-acao {
  padding: 10px 20px;
  border-radius: var(--radius-md, 8px);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.18s, opacity 0.18s;
}

.btn-adicionar {
  background: var(--color-success, #0a7a4a);
  color: #fff;
}

.btn-adicionar:hover {
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
