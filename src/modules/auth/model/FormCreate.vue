<template>
  <form @submit.prevent="$emit('submit')" class="login-form">
    <div class="form-group">
      <label for="email">E-mail institucional</label>
      <input
        id="email"
        :value="email"
        type="email"
        placeholder="seu.email@instituicao.edu.br"
        autocomplete="email"
        required
        @input="$emit('update:email', $event.target.value)"
      />
    </div>

    <div class="form-group">
      <label for="senha">Senha</label>
      <input
        id="senha"
        :value="password"
        type="password"
        placeholder="Digite sua senha"
        autocomplete="current-password"
        required
        @input="$emit('update:password', $event.target.value)"
      />
    </div>

    <!-- Mensagem de erro exibida quando houver falha no login -->
    <div v-if="errorMsg" class="error-message">
      {{ errorMsg }}
    </div>

    <!-- Botão de submissão do formulário -->
    <button type="submit" class="btn-login">
      Entrar no Portal
    </button>
  </form>
</template>

<script setup>
defineProps({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  errorMsg: { type: String, default: '' }
})

defineEmits(['submit', 'update:email', 'update:password'])
</script>

<style scoped>
/* Formulário e campos de entrada */
.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 1.25rem;
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
  background: var(--ser-white, #fff);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input::placeholder {
  color: var(--ser-gray-300, #c0cad9);
}

.form-group input:focus {
  border-color: var(--ser-navy, #003087);
  box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.12);
}

/* Mensagem de erro */
.error-message {
  color: var(--ser-red, #C8102E);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
  background: rgba(200, 16, 46, 0.06);
  border: 1px solid rgba(200, 16, 46, 0.2);
  border-radius: var(--radius-md, 8px);
  padding: 10px 14px;
}

/* Botão de login */
.btn-login {
  width: 100%;
  background: linear-gradient(135deg, #003087 0%, #001f5a 100%);
  color: #ffffff;
  padding: 13px;
  border-radius: var(--radius-md, 8px);
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
}

.btn-login:hover {
  opacity: 0.9;
  box-shadow: 0 4px 16px rgba(0, 48, 135, 0.3);
}

.btn-login:active {
  opacity: 0.95;
  box-shadow: none;
}
</style>
