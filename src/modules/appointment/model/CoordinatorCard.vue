<template>
  <article
    class="coord-card"
    :class="{ 'coord-card--clicavel': selecionavel }"
    :role="selecionavel ? 'button' : undefined"
    :tabindex="selecionavel ? 0 : undefined"
    :aria-label="selecionavel ? `Selecionar ${nome}` : undefined"
    @click="aoClicar"
    @keydown.enter.prevent="aoClicar"
    @keydown.space.prevent="aoClicar"
  >
    <div class="coord-foto">
      <img
        v-if="mostrarFoto"
        :src="fotoResolvida"
        :alt="`Foto de ${nome}`"
        class="coord-foto-img"
        @error="fotoComErro = true"
      />
      <div v-else class="coord-foto-fallback" aria-hidden="true">{{ iniciais }}</div>
    </div>

    <div class="coord-info">
      <h3 class="coord-nome">{{ nome }}</h3>
      <p class="coord-cargo">{{ cargo }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  coordenador: {
    type: Object,
    required: true,
  },
  selecionavel: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['selecionar'])

const fotoComErro = ref(false)

watch(
  () => props.coordenador?.foto_url,
  () => {
    fotoComErro.value = false
  }
)

const nome = computed(() => props.coordenador?.nome || 'Coordenador(a)')
const cargo = computed(() => props.coordenador?.cargo || 'Coordenador(a)')

const fotoResolvida = computed(() => {
  const url = props.coordenador?.foto_url
  if (!url) return ''

  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url

  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`
})

const mostrarFoto = computed(() => Boolean(fotoResolvida.value) && !fotoComErro.value)

const iniciais = computed(() =>
  nome.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
)

function aoClicar() {
  if (!props.selecionavel) return
  emit('selecionar', props.coordenador)
}
</script>

<style scoped>
.coord-card {
  display: flex;
  flex-direction: column;
  height: 440px;
  overflow: hidden;
  background: var(--ser-white, #fff);
  border: none;
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 48, 135, 0.12));
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.coord-card--clicavel {
  cursor: pointer;
}

.coord-card--clicavel:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 48, 135, 0.18));
}

.coord-card--clicavel:focus-visible {
  outline: 3px solid var(--ser-navy-light, #0045b5);
  outline-offset: 3px;
}

/* A foto ocupa 70% da altura do container e não tem borda lateral nem no topo. */
.coord-foto {
  height: 70%;
  min-height: 0;
  background: var(--ser-gray-100, #eef1f7);
}

.coord-foto-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
}

.coord-foto-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #003087 0%, #0045b5 100%);
  color: #fff;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.coord-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 18px 20px;
  border-top: 1px solid var(--color-border, #dde3ef);
}

.coord-nome {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--ser-navy, #003087);
  letter-spacing: -0.01em;
}

.coord-cargo {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ser-gray-500, #6b7a99);
  line-height: 1.4;
}
</style>
