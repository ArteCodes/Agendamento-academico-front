import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Configuração do Firebase SDK cliente.
// Todos os valores devem ser preenchidos via .env (prefixo VITE_ obrigatório).
// Não há fallbacks hardcoded: se qualquer variável faltar, o app exibe um erro claro no console.
const requiredEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missing = requiredEnv.filter((key) => !import.meta.env[key])

if (missing.length > 0) {
  console.error(
    `[Firebase] Variáveis de ambiente não configuradas: ${missing.join(', ')}. ` +
    'Renomeie .env.example para .env e preencha todas as chaves do Firebase.'
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export default app