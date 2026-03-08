<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-white py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">📅</span>
        <h1 class="mt-3 text-3xl font-bold text-gray-900 font-display">Create Account</h1>
        <p class="mt-1 text-gray-500 text-sm">Join LeaveFlow today</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleRegister" novalidate>
          <div class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input v-model="form.name" type="text" class="input" placeholder="John Doe" required />
              <p v-if="fieldError('name')" class="mt-1 text-xs text-red-500">{{ fieldError('name') }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input v-model="form.email" type="email" class="input" placeholder="you@company.com" required />
              <p v-if="fieldError('email')" class="mt-1 text-xs text-red-500">{{ fieldError('email') }}</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input v-model="form.password" type="password" class="input" placeholder="Min. 6 characters" required />
              <p v-if="fieldError('password')" class="mt-1 text-xs text-red-500">{{ fieldError('password') }}</p>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">I am a…</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.role = 'employee'"
                  :class="[
                    'py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all',
                    form.role === 'employee'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  ]"
                >
                  👤 Employee
                </button>
                <button
                  type="button"
                  @click="form.role = 'employer'"
                  :class="[
                    'py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all',
                    form.role === 'employer'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  ]"
                >
                  🏢 Employer
                </button>
              </div>
              <p v-if="fieldError('role')" class="mt-1 text-xs text-red-500">{{ fieldError('role') }}</p>
            </div>

            <!-- Department (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Department <span class="text-gray-400">(optional)</span></label>
              <input v-model="form.department" type="text" class="input" placeholder="e.g. Engineering, HR..." />
            </div>

            <!-- Error -->
            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {{ error }}
            </div>

            <button type="submit" class="btn-primary w-full py-2.5" :disabled="loading">
              <span v-if="loading">Creating account…</span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Sign in</RouterLink>
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

const form = ref({ name: '', email: '', password: '', role: 'employee', department: '' })
const error = ref('')
const validationErrors = ref([])
const loading = ref(false)

function fieldError(field) {
  const e = validationErrors.value.find(e => e.path === field)
  return e?.msg || ''
}

async function handleRegister() {
  error.value = ''
  validationErrors.value = []

  // Client-side validation
  const errs = []
  if (!form.value.name.trim()) errs.push({ path: 'name', msg: 'Name is required' })
  if (!form.value.email) errs.push({ path: 'email', msg: 'Email is required' })
  if (form.value.password.length < 6) errs.push({ path: 'password', msg: 'Password must be at least 6 characters' })
  if (!form.value.role) errs.push({ path: 'role', msg: 'Please select a role' })
  if (errs.length) { validationErrors.value = errs; return }

  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
    } else {
      error.value = err.response?.data?.message || 'Registration failed.'
    }
  } finally {
    loading.value = false
  }
}
</script>
