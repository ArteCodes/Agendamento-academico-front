import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import AuthCreate from '@/modules/auth/views/Create.vue'
import AuthRegister from '@/modules/auth/views/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: AuthCreate,
      meta: { requiresAuth: false }
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: AuthRegister,
      meta: { requiresAuth: false }
    },
    {
      path: '/agendamentos',
      name: 'agendamentos',
      component: () => import('@/modules/appointment/views/List.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/agendamentos/criar',
      name: 'criar-agendamento',
      component: () => import('@/modules/appointment/views/CreateFlow.vue'),
      meta: { requiresAuth: true, canCreate: true },
      children: [
        {
          path: '',
          redirect: { name: 'criar-faq' }
        },
        {
          path: 'faq',
          name: 'criar-faq',
          component: () => import('@/modules/appointment/views/create/Faq.vue')
        },
        {
          path: 'coordenadores',
          name: 'criar-coordenadores',
          component: () => import('@/modules/appointment/views/create/Coordinators.vue')
        },
        {
          path: 'horarios',
          name: 'criar-horarios',
          component: () => import('@/modules/appointment/views/create/Schedule.vue')
        },
        {
          path: 'formulario',
          name: 'criar-formulario',
          component: () => import('@/modules/appointment/views/create/Form.vue')
        },
        {
          path: 'resumo',
          name: 'criar-resumo',
          component: () => import('@/modules/appointment/views/create/Summary.vue')
        }
      ]
    },
    {
      path: '/agendamentos/:id',
      name: 'detalhe-agendamento',
      component: () => import('@/modules/appointment/views/Show.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/gestao',
      name: 'gestao',
      redirect: '/agendamentos',
      meta: { requiresAuth: true }
    },
    {
      path: '/gestao/:id',
      name: 'detalhe-gestao',
      redirect: (to) => `/agendamentos/${to.params.id}`,
      meta: { requiresAuth: true }
    },
    {
      path: '/calendario',
      name: 'calendario',
      component: () => import('@/modules/calendar/views/List.vue'),
      meta: { requiresAuth: true, role: 'coordenador' }
    },
    {
      path: '/gestao-horarios',
      name: 'gestao-horarios',
      component: () => import('@/modules/schedule/views/List.vue'),
      meta: { requiresAuth: true, role: 'coordenador' }
    },
    {
      // Rota raiz: lista unificada para aluno, coordenador e suporte
      path: '/',
      name: 'home',
      redirect: () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return '/login'
        return '/agendamentos'
      }
    }
  ]
})

// Navigation Guard global - protege rotas por autenticação e role.
// Importante: NÃO declarar o parâmetro `next` (API antiga). Com 3 parâmetros
// o Vue Router exige next(); usando apenas retorno, a navegação é resolvida
// automaticamente quando a função retorna.
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Tenta carregar usuário do localStorage na primeira navegação
  if (!authStore.isAuthenticated) {
    authStore.loadFromStorage()
  }

  const requiresAuth = to.meta.requiresAuth
  const requiredRole = to.meta.role

  // Rotas públicas (login/cadastro)
  if (requiresAuth === false) {
    if (to.name === 'login' && authStore.isAuthenticated) {
      return { name: 'agendamentos' }
    }
    return true
  }

  // Rota protegida sem sessão
  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Criação: só aluno ou suporte (coordenador não cria)
  if (to.meta.canCreate && !authStore.canCreate) {
    return { name: 'agendamentos' }
  }

  // Rota com role específico
  if (requiredRole && authStore.userTipo !== requiredRole) {
    return { name: 'agendamentos' }
  }

  return true
})

export default router
