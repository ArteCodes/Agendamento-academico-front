<template>
  <section class="tabela-wrapper">
    <table class="tabela-gestao">
      <thead>
        <tr>
          <th scope="col">Aluno</th>
          <th scope="col">Tipo de Atendimento</th>
          <th scope="col">Data</th>
          <th scope="col">Horário</th>
          <th scope="col">Status</th>
          <th scope="col" class="th-acoes">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="agendamento in items" :key="agendamento.id">
          <td class="col-aluno">{{ agendamento.aluno }}</td>
          <td class="col-nome">{{ agendamento.nome }}</td>
          <td class="col-data">{{ agendamento.data }}</td>
          <td class="col-horario">{{ agendamento.horario }}</td>
          <td class="col-status">
            <span :class="['badge-status', `badge-${agendamento.status.toLowerCase()}`]">
              {{ agendamento.status }}
            </span>
          </td>
          <td class="col-acoes">
            <div class="acoes-container">
              <button
                v-if="agendamento.status === 'Pendente'"
                type="button"
                class="btn-acao btn-validar"
                @click="$emit('validate', agendamento)"
              >
                Confirmar
              </button>
              <button
                type="button"
                class="btn-acao btn-detalhes"
                @click="$emit('show', agendamento)"
              >
                Detalhes
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="6" class="mensagem-vazio">
            Nenhum agendamento encontrado no momento.
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})

defineEmits(['validate', 'show'])
</script>

<style scoped>
.tabela-wrapper {
  width: 100%;
  overflow-x: auto;
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.tabela-gestao {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.tabela-gestao th {
  background: #ffffff;
  color: #003087;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 14px 20px;
  border-bottom: 2px solid var(--color-border, #dde3ef);
  white-space: nowrap;
}

.tabela-gestao td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--ser-gray-100, #eef1f7);
  color: var(--ser-gray-900, #0d1b3e);
  vertical-align: middle;
}

.tabela-gestao tbody tr:last-child td {
  border-bottom: none;
}

.th-acoes {
  text-align: center;
}

.tabela-gestao tbody tr:hover {
  background: var(--ser-gray-50, #f7f9fc);
}

/* Badges */
.badge-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 20px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.badge-pendente {
  background: rgba(180, 83, 9, 0.10);
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.25);
}

.badge-confirmado {
  background: rgba(10, 122, 74, 0.10);
  color: #0a7a4a;
  border: 1px solid rgba(10, 122, 74, 0.25);
}

.badge-cancelado {
  background: rgba(200, 16, 46, 0.10);
  color: #C8102E;
  border: 1px solid rgba(200, 16, 46, 0.25);
}

/* Ações */
.acoes-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-acao {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-sm, 4px);
  border: none;
  cursor: pointer;
  transition: background 0.18s, opacity 0.18s;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
}

.btn-validar {
  background: var(--color-success, #0a7a4a);
  color: #fff;
}

.btn-validar:hover {
  background: #086040;
}

.btn-detalhes {
  background: var(--ser-navy, #003087);
  color: #fff;
}

.btn-detalhes:hover {
  background: var(--ser-navy-light, #0045b5);
}

.mensagem-vazio {
  text-align: center;
  padding: 48px 1rem;
  color: var(--ser-gray-500, #6b7a99);
  font-size: 0.9375rem;
}
</style>
