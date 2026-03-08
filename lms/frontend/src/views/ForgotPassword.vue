<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-white">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">🔐</span>
        <h1 class="mt-3 text-3xl font-bold text-gray-900 font-display">Reset Password</h1>
        <p class="mt-1 text-gray-500 text-sm">Answer your security question to reset your password</p>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div v-for="s in 3" :key="s" class="flex items-center gap-2">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
            step > s ? 'bg-emerald-500 text-white' :
            step === s ? 'bg-primary-600 text-white' :
            'bg-gray-200 text-gray-500']">
            <span v-if="step > s">✓</span>
            <span v-else>{{ s }}</span>
          </div>
          <div v-if="s < 3" :class="['w-8 h-0.5 transition-all', step > s ? 'bg-emerald-500' : 'bg-gray-200']"></div>
        </div>
      </div>

      <div class="card p-8">

        <!-- Step 1: Enter Email -->
        <div v-if="step === 1">
          <h2 class="font-semibold text-gray-900 mb-1 font-display">Step 1 — Enter your email</h2>
          <p class="text-sm text-gray-500 mb-5">We'll find your security question.</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input v-model="email" type="email" class="input" placeholder="you@company.com" />
            </div>
            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{{ error }}</div>
            <button @click="findQuestion" class="btn-primary w-full py-2.5" :disabled="loading">
              <span v-if="loading">Looking up…</span>
              <span v-else>Continue →</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Answer Security Question -->
        <div v-if="step === 2">
          <h2 class="font-semibold text-gray-900 mb-1 font-display">Step 2 — Answer your question</h2>
          <p class="text-sm text-gray-500 mb-5">Answer the security question you set up during registration.</p>
          <div class="space-y-4">
            <div class="bg-primary-50 border border-primary-100 rounded-lg px-4 py-3">
              <p class="text-xs text-primary-500 font-medium mb-1">Your security question:</p>
              <p class="text-sm font-medium text-primary-900">{{ securityQuestion }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
              <input v-model="securityAnswer" type="text" class="input" placeholder="Enter your answer" />
              <p class="mt-1 text-xs text-gray-400">Not case-sensitive</p>
            </div>
            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{{ error }}</div>
            <div class="flex gap-3">
              <button @click="step = 1; error = ''" class="btn-secondary flex-1 py-2.5">← Back</button>
              <button @click="verifyAnswer" class="btn-primary flex-1 py-2.5" :disabled="loading">
                <span v-if="loading">Verifying…</span>
                <span v-else>Verify →</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Set New Password -->
        <div v-if="step === 3">
          <h2 class="font-semibold text-gray-900 mb-1 font-display">Step 3 — Set new password</h2>
          <p class="text-sm text-gray-500 mb-5">Choose a strong new password for your account.</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div class="relative">
                <input v-model="newPassword" :type="showNew ? 'text' : 'password'" class="input pr-10" placeholder="Min. 6 characters" />
                <button type="button" @click="showNew = !showNew"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {{ showNew ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <div class="relative">
                <input v-model="confirmNewPassword" :type="showConfirm ? 'text' : 'password'"
                  class="input pr-10 transition-all"
                  :class="confirmNewPassword ? (newPassword === confirmNewPassword ? 'border-emerald-400' : 'border-red-400') : ''"
                  placeholder="Re-enter new password" />
                <button type="button" @click="showConfirm = !showConfirm"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {{ showConfirm ? '🙈' : '👁️' }}
                </button>
              </div>
              <p v-if="confirmNewPassword && newPassword !== confirmNewPassword" class="mt-1 text-xs text-red-500">❌ Passwords do not match</p>
              <p v-else-if="confirmNewPassword && newPassword === confirmNewPassword" class="mt-1 text-xs text-emerald-600">✅ Passwords match</p>
            </div>
            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{{ error }}</div>
            <div v-if="success" class="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              ✅ {{ success }}
            </div>
            <button @click="resetPassword" class="btn-primary w-full py-2.5" :disabled="loading || !!success">
              <span v-if="loading">Resetting…</span>
              <span v-else-if="success">Redirecting to login…</span>
              <span v-else>Reset Password</span>
            </button>
          </div>
        </div>

      </div>

      <p class="mt-6 text-center text-sm text-gray-500">
        Remember your password?
        <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const step = ref(1)
const email = ref('')
const securityQuestion = ref('')
const securityAnswer = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showNew = ref(false)
const showConfirm = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

async function findQuestion() {
  error.value = ''
  if (!email.value) { error.value = 'Please enter your email.'; return }
  loading.value = true
  try {
    const res = await api.post('/auth/forgot-password/question', { email: email.value })
    securityQuestion.value = res.data.securityQuestion
    step.value = 2
  } catch (err) {
    error.value = err.response?.data?.message || 'Email not found.'
  } finally {
    loading.value = false
  }
}

async function verifyAnswer() {
  error.value = ''
  if (!securityAnswer.value.trim()) { error.value = 'Please enter your answer.'; return }
  // We verify the answer only during the actual reset step on the backend
  // Move to step 3 to collect new password
  step.value = 3
}

async function resetPassword() {
  error.value = ''
  if (newPassword.value.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  if (newPassword.value !== confirmNewPassword.value) { error.value = 'Passwords do not match.'; return }
  loading.value = true
  try {
    const res = await api.post('/auth/forgot-password/reset', {
      email: email.value,
      securityAnswer: securityAnswer.value,
      newPassword: newPassword.value,
    })
    success.value = res.data.message
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Reset failed. Please try again.'
    if (error.value.includes('Incorrect')) step.value = 2
  } finally {
    loading.value = false
  }
}
</script>
