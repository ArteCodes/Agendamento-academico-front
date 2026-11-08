<script setup>
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import { storeToRefs } from 'pinia'
import logoUninassau from '@/assets/logo-uninassau.png'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated, isAluno, isCoordenador, isSuporte, userName, userTipo } = storeToRefs(authStore)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Navbar institucional branca com logo UNINASSAU -->
  <nav v-if="isAuthenticated" class="navbar">
    <div class="navbar-brand">
      <img :src="logoUninassau" alt="UNINASSAU" class="navbar-logo-img" />
      <div class="brand-divider"></div>
      <span class="navbar-title">Sistema de Agendamentos</span>
    </div>

    <div class="navbar-links">
      <!-- Link só para Aluno -->
      <RouterLink v-if="isAluno" to="/agendamentos" class="nav-link">
        Meus Agendamentos
      </RouterLink>

      <!-- Links só para Coordenador -->
      <RouterLink v-if="isCoordenador" to="/gestao" class="nav-link">
        Gestão
      </RouterLink>
      <RouterLink v-if="isCoordenador" to="/gestao-horarios" class="nav-link">
        Gestão de Horários
      </RouterLink>
      <RouterLink v-if="isCoordenador" to="/calendario" class="nav-link">
        Calendário
      </RouterLink>
    </div>

    <div class="navbar-user">
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-badge" :class="{ 'badge-aluno': isAluno, 'badge-coord': isCoordenador }">
          {{ isAluno ? 'Aluno' : 'Coordenador' }}
        </span>
      </div>
      <button class="btn-logout" @click="handleLogout">Sair</button>
    </div>
  </nav>

  <main :class="{ 'with-navbar': isAuthenticated }">
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 68px;
  background-color: #ffffff;
  border-bottom: 3px solid #003087;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 14px rgba(0, 48, 135, 0.08);
}

/* ── Brand com Logo UNINASSAU ── */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.navbar-logo-img {
  height: 38px;
  width: auto;
  object-fit: contain;
  display: block;
}

.brand-divider {
  width: 1px;
  height: 28px;
  background-color: #dde3ef;
}

.navbar-title {
  font-weight: 800;
  font-size: 15px;
  color: #003087;
  letter-spacing: -0.01em;
}

/* ── Links de Navegação com letras azuis ── */
.navbar-links {
  display: flex;
  gap: 6px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #003087;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.18s ease;
  letter-spacing: 0.01em;
}

.nav-link:hover {
  background-color: rgba(0, 48, 135, 0.07);
  color: #001f5a;
}

.nav-link.router-link-active {
  background-color: #003087;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 48, 135, 0.2);
}

/* ── Informações do Usuário ── */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.user-name {
  font-size: 13.5px;
  color: #003087;
  font-weight: 700;
}

.user-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-aluno {
  background-color: rgba(0, 48, 135, 0.08);
  color: #003087;
  border: 1px solid rgba(0, 48, 135, 0.2);
}

.badge-coord {
  background-color: rgba(200, 16, 46, 0.08);
  color: #C8102E;
  border: 1px solid rgba(200, 16, 46, 0.2);
}

.btn-logout {
  padding: 7px 16px;
  border: 1.5px solid #dde3ef;
  border-radius: 8px;
  background: #ffffff;
  color: #374569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  letter-spacing: 0.01em;
}

.btn-logout:hover {
  background: #C8102E;
  color: #ffffff;
  border-color: #C8102E;
}

/* ── Layout ── */
main {
  min-height: 100vh;
  background-color: #f8fafc;
}

main.with-navbar {
  padding-top: 68px;
}
</style>
