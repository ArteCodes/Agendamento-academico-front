<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <!-- Toggle tipo de usuário: aluno (padrão) ou não aluno -->
    <div class="tipo-toggle">
      <label class="tipo-option" :class="{ active: tipo === 'aluno' }">
        <input type="radio" value="aluno" :checked="tipo === 'aluno'" @change="tipo = 'aluno'" />
        <span>Aluno</span>
      </label>
      <label class="tipo-option" :class="{ active: tipo === 'nao_aluno' }">
        <input type="radio" value="nao_aluno" :checked="tipo === 'nao_aluno'" @change="tipo = 'nao_aluno'" />
        <span>Não sou aluno</span>
      </label>
    </div>
    <p v-if="tipo === 'nao_aluno'" class="tipo-hint">O campo matrícula será desconsiderado.</p>

    <div class="form-group">
      <label for="nome">Nome completo</label>
      <input
        id="nome"
        :value="nome"
        @input="nome = $event.target.value"
        @blur="markTouched('nome')"
        placeholder="Digite seu nome completo"
        :class="{ invalid: !!nomeError }"
      />
      <span v-if="nomeError" class="field-error">{{ nomeError }}</span>
    </div>

    <div class="form-group">
      <label for="email">E-mail</label>
      <input
        id="email"
        type="email"
        :value="email"
        @input="email = $event.target.value"
        @blur="markTouched('email')"
        placeholder="seu.email@instituicao.edu.br"
        :class="{ invalid: !!emailError }"
      />
      <span v-if="emailError" class="field-error">{{ emailError }}</span>
    </div>

    <div class="form-group">
      <label for="senha">Senha</label>
      <input
        id="senha"
        type="password"
        :value="senha"
        @input="senha = $event.target.value"
        @blur="markTouched('senha')"
        placeholder="Mínimo 8 caracteres, letras e números"
        :class="{ invalid: !!senhaError }"
      />
      <span v-if="senhaError" class="field-error">{{ senhaError }}</span>
      <p class="password-hint">Mínimo 8 caracteres, contendo pelo menos uma letra e um número.</p>
    </div>

    <div class="form-group">
      <label for="telefone">Telefone</label>
      <input
        id="telefone"
        :value="telefone"
        @input="telefone = maskTel($event.target.value)"
        @blur="markTouched('telefone')"
        placeholder="(00) 00000-0000"
        maxlength="15"
        :class="{ invalid: !!telefoneError }"
      />
      <span v-if="telefoneError" class="field-error">{{ telefoneError }}</span>
    </div>

    <div class="form-group">
      <label for="cpf">CPF</label>
      <input
        id="cpf"
        :value="cpf"
        @input="cpf = maskCpf($event.target.value)"
        @blur="markTouched('cpf')"
        placeholder="000.000.000-00"
        maxlength="14"
        :class="{ invalid: !!cpfError }"
      />
      <span v-if="cpfError" class="field-error">{{ cpfError }}</span>
    </div>

    <div v-if="tipo === 'aluno'" class="form-group">
      <label for="matricula">Matrícula</label>
      <input
        id="matricula"
        :value="matricula"
        @input="matricula = $event.target.value"
        @blur="markTouched('matricula')"
        placeholder="Digite sua matrícula"
        :class="{ invalid: !!matriculaError }"
      />
      <span v-if="matriculaError" class="field-error">{{ matriculaError }}</span>
    </div>

    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

    <button type="submit" :disabled="isLoading" class="btn-register">
      {{ isLoading ? 'Cadastrando...' : 'Cadastrar conta' }}
    </button>

    <p class="login-link">
      Já possui conta?{' '}
      <a href="#" @click.prevent="emit('go-login')">Fazer login</a>
    </p>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  errorMsg: { type: String, default: '' },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'go-login'])

const tipo = ref('aluno')
const nome = ref('')
const email = ref('')
const senha = ref('')
const telefone = ref('')
const cpf = ref('')
const matricula = ref('')

const touched = ref(new Set())
const submitted = ref(false)

function maskCpf(value) {
  let v = (value || '').replace(/\D/g, '')
  if (v.length > 3) v = v.replace(/^(\d{3})(\d)/, '$1.$2')
  if (v.length > 7) v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
  if (v.length > 11) v = v.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  return v
}

function maskTel(value) {
  let v = (value || '').replace(/\D/g, '')
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 10) v = v.replace(/^\((\d{2})\) (\d{5})(\d)/, '($1) $2-$3')
  else if (v.length > 7) v = v.replace(/^\((\d{2})\) (\d{4})(\d)/, '($1) $2-$3')
  return v
}

function validarCPF(cpfValue) {
  const digitos = (cpfValue || '').replace(/\D/g, '')
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(digitos.charAt(i), 10) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(digitos.charAt(9), 10)) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(digitos.charAt(i), 10) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(digitos.charAt(10), 10)
}

function senhaForte(senhaValue) {
  return senhaValue.length >= 8 && /[A-Za-z]/.test(senhaValue) && /[0-9]/.test(senhaValue)
}

const nomeError = computed(() => {
  if (!touched.value.has('nome') && !submitted.value) return ''
  if (!nome.value.trim()) return 'Nome é obrigatório.'
  if (nome.value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
  return ''
})

const emailError = computed(() => {
  if (!touched.value.has('email') && !submitted.value) return ''
  if (!email.value.trim()) return 'E-mail é obrigatório.'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email.value)) return 'E-mail inválido.'
  return ''
})

const senhaError = computed(() => {
  if (!touched.value.has('senha') && !submitted.value) return ''
  if (!senha.value) return 'Senha é obrigatória.'
  if (!senhaForte(senha.value)) return 'Senha fraca: mínimo 8 caracteres, letras e números.'
  return ''
})

const telefoneError = computed(() => {
  if (!touched.value.has('telefone') && !submitted.value) return ''
  if (!telefone.value.trim()) return 'Telefone é obrigatório.'
  const digitos = telefone.value.replace(/\D/g, '')
  if (digitos.length < 10 || digitos.length > 11) return 'Telefone inválido.'
  return ''
})

const cpfError = computed(() => {
  if (!touched.value.has('cpf') && !submitted.value) return ''
  if (!cpf.value.trim()) return 'CPF é obrigatório.'
  if (!validarCPF(cpf.value)) return 'CPF inválido.'
  return ''
})

const matriculaError = computed(() => {
  if (tipo.value !== 'aluno') return ''
  if (!touched.value.has('matricula') && !submitted.value) return ''
  if (!matricula.value.trim()) return 'Matrícula é obrigatória.'
  return ''
})

function markTouched(field) {
  touched.value.add(field)
}

function handleSubmit() {
  submitted.value = true
  const errors = {
    nome: nomeError.value,
    email: emailError.value,
    senha: senhaError.value,
    telefone: telefoneError.value,
    cpf: cpfError.value,
    matricula: matriculaError.value,
  }
  if (Object.values(errors).some(Boolean)) return

  const payload = {
    nome: nome.value.trim(),
    email: email.value.trim(),
    senha: senha.value,
    telefone: telefone.value,
    tipo: tipo.value,
    cpf: cpf.value.replace(/\D/g, ''),
  }
  if (tipo.value === 'aluno') {
    payload.matricula = matricula.value.trim()
  }

  emit('submit', payload)
}
</script>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.tipo-toggle {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.tipo-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border: 1.5px solid var(--ser-gray-200, #dde3ef);
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ser-gray-700, #374569);
  background: #fff;
  transition: all 0.2s ease;
}

.tipo-option.active {
  border-color: var(--ser-navy, #003087);
  background: #eef1f7;
  color: var(--ser-navy, #003087);
}

.tipo-option input {
  accent-color: var(--ser-navy, #003087);
}

.tipo-hint {
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--ser-gray-500, #6b7a99);
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 0;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #003087;
  margin-bottom: 0.45rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.form-group input {
  width: 100%;
  padding: 11px 14px;
  border-radius: var(--radius-md, 8px);
  border: 1.5px solid var(--ser-gray-200, #dde3ef);
  box-sizing: border-box;
  font-size: 0.9375rem;
  color: var(--ser-gray-900, #0d1b3e);
  outline: none;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  border-color: var(--ser-navy, #003087);
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.12);
}

.form-group input.invalid {
  border-color: var(--ser-red, #C8102E);
}

.field-error {
  color: var(--ser-red, #C8102E);
  font-size: 0.78rem;
  margin-top: 0.4rem;
}

.password-hint {
  margin: 0.35rem 0 0 0;
  font-size: 0.78rem;
  color: var(--ser-gray-500, #6b7a99);
}

.error-message {
  color: var(--ser-red, #C8102E);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: 500;
  background: rgba(200, 16, 46, 0.06);
  border: 1px solid rgba(200, 16, 46, 0.2);
  border-radius: var(--radius-md, 8px);
  padding: 10px 14px;
}

.btn-register {
  width: 100%;
  background: linear-gradient(135deg, #003087 0%, #001f5a 100%);
  color: #ffffff;
  padding: 13px;
  border-radius: var(--radius-md, 8px);
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.btn-register:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 16px rgba(0, 48, 135, 0.3);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1.2rem;
  font-size: 0.85rem;
  color: var(--ser-gray-700, #374569);
  text-align: center;
}

.login-link a {
  color: var(--ser-navy, #003087);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.login-link a:hover {
  text-decoration: none;
}
</style>