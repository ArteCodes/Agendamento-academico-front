<template>
  <div class="modal-backdrop" @click.self="$emit('continuar')">
    <div class="modal-card">
      <header class="modal-cabecalho">
        <h2 class="modal-titulo">Alterações não salvas</h2>
        <button type="button" class="btn-fechar-icone" @click="$emit('continuar')">&times;</button>
      </header>
      <div class="modal-corpo">
        <p class="msg">As horas semanais <strong>não foram completas</strong> ou há alterações <strong>não salvas</strong>.</p>
        <div class="resumo">
          <span>Horas salvas: <strong>{{ horasSalvas }}h</strong> de <strong>{{ metaHoras }}h</strong></span>
          <span>Não salvos: <strong>{{ qtdRascunho }}</strong></span>
        </div>
        <p class="alerta">Se sair agora sem confirmar, os novos horários serão descartados.</p>
      </div>
      <footer class="modal-rodape">
        <button type="button" class="btn-acao btn-sair" @click="$emit('sair')">Sair sem salvar</button>
        <button type="button" class="btn-acao btn-continuar" @click="$emit('continuar')">Continuar editando</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
defineProps({
  horasSalvas: { type: String, default: '0' },
  metaHoras: { type: Number, default: 20 },
  qtdRascunho: { type: Number, default: 0 }
})

defineEmits(['sair', 'continuar'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(13, 27, 62, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
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
  color: var(--ser-red, #C8102E);
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
  color: var(--ser-gray-700, #374569);
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 0.9375rem;
}

.msg, .alerta {
  margin: 0;
}

.resumo {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(200, 16, 46, 0.05);
  border: 1px solid rgba(200, 16, 46, 0.15);
  border-radius: var(--radius-md, 8px);
  padding: 12px 16px;
  font-size: 0.875rem;
}

.alerta {
  font-size: 0.8125rem;
  color: #b45309;
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
  transition: background 0.18s;
}

.btn-sair {
  background: var(--ser-red, #C8102E);
  color: #fff;
}

.btn-sair:hover {
  background: var(--ser-red-dark, #9e0c24);
}

.btn-continuar {
  background: var(--ser-navy, #003087);
  color: #fff;
}

.btn-continuar:hover {
  background: var(--ser-navy-light, #0045b5);
}
</style>
