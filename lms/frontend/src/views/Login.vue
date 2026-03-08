<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-white">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">📅</span>
        <h1 class="mt-3 text-3xl font-bold text-gray-900 font-display">LeaveFlow</h1>
        <p class="mt-1 text-gray-500 text-sm">Sign in to your account</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleLogin" novalidate>
          <div class="space-y-5">

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input v-model="form.email" type="email" class="input" placeholder="you@company.com" required />
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <RouterLink to="/forgot-password" class="text-xs text-primary-600 hover:underline">
                  Forgot password?
                </RouterLink>
              </div>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {{ error }}
            </div>

            <button type="submit" class="btn-primary w-full py-2.5" :disabled="loading">
              <span v-if="loading">Signing in…</span>
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Don't have an account?
          <RouterLink to="/register" class="text-primary-600 font-medium hover:underline">Register</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  error.value = ''
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields.'
    return
  }
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
