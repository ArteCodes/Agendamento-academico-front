<template>
  <section class="faq">
    <div class="faq-intro">
      <h2 class="faq-titulo">Dúvidas Frequentes</h2>
      <p class="faq-texto">
        Confira as respostas mais comuns antes de solicitar seu atendimento com a coordenação.
      </p>
    </div>

    <div class="faq-lista">
      <details v-for="item in perguntasFrequentes" :key="item.id" class="faq-item">
        <summary class="faq-pergunta">
          <span>{{ item.pergunta }}</span>
          <span class="faq-icone" aria-hidden="true">+</span>
        </summary>
        <p class="faq-resposta">{{ item.resposta }}</p>
      </details>
    </div>

    <div class="faq-rodape">
      <p class="faq-rodape-texto">{{ FAQ_RODAPE }}</p>
      <button type="button" class="btn-coordenadores" @click="irParaCoordenadores">
        Falar com um coordenador
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { FAQ_RODAPE, perguntasFrequentes } from '@/modules/appointment/data/faq'

const router = useRouter()

function irParaCoordenadores() {
  router.push({ name: 'criar-coordenadores' })
}
</script>

<style scoped>
.faq {
  max-width: 820px;
  margin: 0 auto;
}

.faq-intro {
  margin-bottom: 20px;
}

.faq-titulo {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
}

.faq-texto {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--ser-gray-500, #6b7a99);
}

/* ── Lista ── */
.faq-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--ser-white, #fff);
  border: 1px solid var(--color-border, #dde3ef);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
  overflow: hidden;
}

.faq-pergunta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  cursor: pointer;
  list-style: none;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ser-gray-900, #0d1b3e);
  transition: background 0.18s;
}

.faq-pergunta::-webkit-details-marker {
  display: none;
}

.faq-pergunta:hover {
  background: var(--ser-gray-50, #f7f9fc);
}

.faq-icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 48, 135, 0.08);
  color: var(--ser-navy, #003087);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1;
  transition: transform 0.18s, background 0.18s;
}

.faq-item[open] .faq-icone {
  transform: rotate(45deg);
  background: var(--ser-navy, #003087);
  color: #fff;
}

.faq-resposta {
  margin: 0;
  padding: 0 22px 20px;
  font-size: 0.9rem;
  color: var(--ser-gray-700, #374569);
  line-height: 1.65;
}

/* ── Rodapé ── */
.faq-rodape {
  margin-top: 28px;
  padding: 24px;
  background: var(--ser-white, #fff);
  border-radius: var(--radius-lg, 12px);
  border-left: 4px solid var(--ser-navy, #003087);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 48, 135, 0.08));
}

.faq-rodape-texto {
  margin: 0 0 16px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ser-gray-700, #374569);
}

.btn-coordenadores {
  padding: 12px 26px;
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

.btn-coordenadores:hover {
  opacity: 0.92;
  box-shadow: 0 4px 14px rgba(0, 48, 135, 0.25);
}
</style>
