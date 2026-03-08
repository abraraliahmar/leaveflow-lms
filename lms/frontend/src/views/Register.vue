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

            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input v-model="form.name" type="text" class="input" placeholder="John Doe" />
              <p v-if="fieldError('name')" class="mt-1 text-xs text-red-500">{{ fieldError('name') }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input v-model="form.email" type="email" class="input" placeholder="you@company.com" />
              <p v-if="fieldError('email')" class="mt-1 text-xs text-red-500">{{ fieldError('email') }}</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <!-- Password strength -->
              <div v-if="form.password" class="mt-2">
                <div class="flex gap-1 mb-1">
                  <div v-for="i in 4" :key="i"
                    :class="['h-1 flex-1 rounded-full transition-all duration-300', i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200']">
                  </div>
                </div>
                <p :class="['text-xs font-medium', passwordStrength.textColor]">{{ passwordStrength.label }}</p>
              </div>
              <p v-if="fieldError('password')" class="mt-1 text-xs text-red-500">{{ fieldError('password') }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="input pr-10 transition-all"
                  :class="form.confirmPassword ? (passwordsMatch ? 'border-emerald-400 focus:ring-emerald-400' : 'border-red-400 focus:ring-red-400') : ''"
                  placeholder="Re-enter your password"
                />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors">
                  {{ showConfirmPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <p v-if="form.confirmPassword && !passwordsMatch" class="mt-1 text-xs text-red-500">❌ Passwords do not match</p>
              <p v-else-if="form.confirmPassword && passwordsMatch" class="mt-1 text-xs text-emerald-600">✅ Passwords match</p>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">I am a…</label>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" @click="form.role = 'employee'"
                  :class="['py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all', form.role === 'employee' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
                  👤 Employee
                </button>
                <button type="button" @click="form.role = 'employer'"
                  :class="['py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all', form.role === 'employer' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
                  🏢 Employer
                </button>
              </div>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Department <span class="text-gray-400 font-normal">(optional)</span></label>
              <input v-model="form.department" type="text" class="input" placeholder="e.g. Engineering, HR..." />
            </div>

            <!-- Security Question Section -->
            <div class="border-t border-gray-100 pt-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🔐 Password Recovery Setup</p>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Security Question</label>
                  <select v-model="form.securityQuestion" class="input">
                    <option value="" disabled>Select a question…</option>
                    <option v-for="q in securityQuestions" :key="q" :value="q">{{ q }}</option>
                  </select>
                  <p v-if="fieldError('securityQuestion')" class="mt-1 text-xs text-red-500">{{ fieldError('securityQuestion') }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
                  <input v-model="form.securityAnswer" type="text" class="input" placeholder="Answer (not case-sensitive)" />
                  <p class="mt-1 text-xs text-gray-400">Used to reset your password if you forget it.</p>
                  <p v-if="fieldError('securityAnswer')" class="mt-1 text-xs text-red-500">{{ fieldError('securityAnswer') }}</p>
                </div>
              </div>
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
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const securityQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favourite childhood movie?",
  "What was your childhood nickname?",
  "What street did you grow up on?",
]

const form = ref({
  name: '', email: '', password: '', confirmPassword: '',
  role: 'employee', department: '',
  securityQuestion: '', securityAnswer: '',
})

const error = ref('')
const validationErrors = ref([])
const loading = ref(false)

const passwordsMatch = computed(() => form.value.password === form.value.confirmPassword)

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return { score: 0 }
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { label: 'Weak — add more characters', color: 'bg-red-400', textColor: 'text-red-500' },
    { label: 'Fair — try adding numbers', color: 'bg-amber-400', textColor: 'text-amber-500' },
    { label: 'Good — nearly there!', color: 'bg-blue-400', textColor: 'text-blue-500' },
    { label: 'Strong password!', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  ]
  return { score, ...levels[Math.min(score - 1, 3)] }
})

function fieldError(field) {
  return validationErrors.value.find(e => e.path === field)?.msg || ''
}

async function handleRegister() {
  error.value = ''
  validationErrors.value = []

  const errs = []
  if (!form.value.name.trim()) errs.push({ path: 'name', msg: 'Name is required' })
  if (!form.value.email) errs.push({ path: 'email', msg: 'Email is required' })
  if (form.value.password.length < 6) errs.push({ path: 'password', msg: 'Password must be at least 6 characters' })
  if (!passwordsMatch.value) errs.push({ path: 'confirmPassword', msg: 'Passwords do not match' })
  if (!form.value.securityQuestion) errs.push({ path: 'securityQuestion', msg: 'Please select a security question' })
  if (!form.value.securityAnswer.trim()) errs.push({ path: 'securityAnswer', msg: 'Security answer is required' })
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
