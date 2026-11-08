<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import FormCreate from '@/modules/auth/model/FormCreate.vue'
import logoSer from '@/assets/logo-ser.png'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const senha = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (isLoading.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const success = await authStore.login(email.value, senha.value)
    if (success) {
      router.push('/agendamentos')
    } else {
      errorMsg.value = 'E-mail ou senha inválidos. Verifique suas credenciais.'
    }
  } catch (error) {
    errorMsg.value = 'E-mail ou senha inválidos. Verifique suas credenciais.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Painel esquerdo — fundo branco e letras azuis -->
      <aside class="login-aside">
        <div class="aside-content">
          <div class="aside-logo">
            <img :src="logoSer" alt="SER Educacional" class="aside-logo-img" />
          </div>
          <h2 class="aside-title">Portal Acadêmico</h2>
          <p class="aside-desc">
            Sistema Integrado de Agendamentos para atendimentos acadêmicos, psicológicos, sociais e nutricionais.
          </p>
          <ul class="aside-list">
            <li>Agendamento simplificado</li>
            <li>Acompanhamento em tempo real</li>
            <li>Gestão integrada de horários</li>
          </ul>
        </div>
        <div class="aside-stripe"></div>
      </aside>

      <!-- Painel direito — formulário de acesso -->
      <main class="login-main">
        <div class="login-card">
          <div class="card-header">
            <div class="brand-logo-container">
              <img :src="logoSer" alt="Grupo SER Educacional" class="ser-logo-img" />
            </div>
            <h1 class="card-title">Acesso ao Sistema</h1>
            <p class="card-subtitle">Informe suas credenciais institucionais para continuar</p>
          </div>
          <FormCreate v-model:email="email" v-model:password="senha" :error-msg="errorMsg" @submit="handleLogin" />
          <p class="login-footer-note">Acesso exclusivo para alunos e coordenadores cadastrados.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  background-color: #ffffff;
}

.login-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* ── Painel lateral com fundo branco e letras azuis ── */
.login-aside {
  display: none;
  width: 440px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid var(--color-border, #dde3ef);
  position: relative;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
}

@media (min-width: 900px) {
  .login-aside {
    display: flex;
  }
}

.aside-content {
  padding: 64px 48px;
  display: flex;
  flex-direction: column;
  gap: 26px;
  position: relative;
  z-index: 1;
}

.aside-logo {
  margin-bottom: 8px;
}

.aside-logo-img {
  max-width: 190px;
  height: auto;
  display: block;
}

.aside-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #003087;
  letter-spacing: -0.02em;
}

.aside-desc {
  font-size: 0.95rem;
  color: #1e3a8a;
  line-height: 1.65;
}

.aside-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aside-list li {
  font-size: 0.9rem;
  color: #003087;
  font-weight: 600;
  padding-left: 22px;
  position: relative;
}

.aside-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #C8102E;
  border-radius: 50%;
}

.aside-stripe {
  height: 6px;
  background: linear-gradient(90deg, #003087 0%, #C8102E 100%);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

/* ── Área do Formulário ── */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  background-color: #f8fafc;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 35px rgba(0, 48, 135, 0.08);
  max-width: 440px;
  width: 100%;
  padding: 2.75rem 2.25rem;
  border-top: 4px solid #003087;
  border-left: 1px solid var(--color-border, #dde3ef);
  border-right: 1px solid var(--color-border, #dde3ef);
  border-bottom: 1px solid var(--color-border, #dde3ef);
}

.card-header {
  margin-bottom: 1.75rem;
  text-align: center;
}

.brand-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.25rem;
}

.ser-logo-img {
  max-width: 180px;
  height: auto;
  object-fit: contain;
}

.card-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #003087;
  margin-bottom: 0.35rem;
  letter-spacing: -0.01em;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #1e3a8a;
  font-weight: 500;
}

.login-footer-note {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #374569;
  text-align: center;
  border-top: 1px solid var(--ser-gray-200, #dde3ef);
  padding-top: 1rem;
}
</style>
