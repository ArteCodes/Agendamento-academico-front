import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useDataStore } from '@/modules/data/store/data'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializa o store centralizado de dados (usuários + agendamentos)
// Carrega do localStorage ou usa mocks na primeira execução
const dataStore = useDataStore()
dataStore.initialize().then(() => {
  app.mount('#app')
})
