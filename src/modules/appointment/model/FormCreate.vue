<template>
  <form @submit.prevent="$emit('submit')" class="form">
    <div class="form-group">
      <label for="tipo">Tipo de Atendimento</label>
      <select id="tipo" :value="form.tipo" class="input" required @change="$emit('update:field', { field: 'tipo', value: $event.target.value })">
        <option value="Consulta Psicológica">Consulta Psicológica</option>
        <option value="Orientação Acadêmica">Orientação Acadêmica</option>
        <option value="Atendimento Social">Atendimento Social</option>
        <option value="Consulta Nutricional">Consulta Nutricional</option>
      </select>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="data">Data</label>
        <input id="data" :value="form.data" type="date" class="input" required @input="$emit('update:field', { field: 'data', value: $event.target.value })" />
      </div>

      <div class="form-group">
        <label for="horario">Horário</label>
        <input id="horario" :value="form.horario" type="time" class="input" required @input="$emit('update:field', { field: 'horario', value: $event.target.value })" />
      </div>
    </div>

    <div class="form-group">
      <label for="local">Local Previsto</label>
      <input id="local" :value="form.local" type="text" class="input" placeholder="Ex: Sala 201 ou Online" @input="$emit('update:field', { field: 'local', value: $event.target.value })" />
    </div>

    <div class="form-group">
      <label for="descricao">Descrição / Observações</label>
      <textarea id="descricao" :value="form.descricao" class="input textarea" rows="3" placeholder="Descreva o motivo do agendamento..." @input="$emit('update:field', { field: 'descricao', value: $event.target.value })"></textarea>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-submit">Solicitar Agendamento</button>
    </div>
  </form>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true }
})

defineEmits(['submit', 'cancel', 'update:field'])
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.input {
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
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.10);
}

.input::placeholder {
  color: var(--ser-gray-300, #c0cad9);
}

.textarea {
  resize: vertical;
  min-height: 90px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1.5px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-md, 8px);
  background: var(--ser-white, #fff);
  color: var(--ser-gray-700, #374569);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: var(--ser-gray-100, #eef1f7);
}

.btn-submit {
  flex: 2;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: linear-gradient(135deg, #003087 0%, #001f5a 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s, box-shadow 0.18s;
  font-family: inherit;
  letter-spacing: 0.01em;
}

.btn-submit:hover {
  opacity: 0.9;
  box-shadow: 0 4px 14px rgba(0, 48, 135, 0.25);
}
</style>
