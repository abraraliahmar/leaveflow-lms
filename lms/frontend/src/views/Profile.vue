<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 font-display">My Profile</h1>
      <p class="text-gray-500 mt-1 text-sm">Manage your account settings and password.</p>
    </div>

    <!-- Profile Card -->
    <div class="card p-6 mb-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700 font-display">
          {{ getInitials(auth.user?.name) }}
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ auth.user?.name }}</h2>
          <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
          <span class="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
            {{ auth.user?.role }}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-gray-400 text-xs mb-1">Department</p>
          <p class="font-medium text-gray-700">{{ auth.user?.department || 'Not set' }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-gray-400 text-xs mb-1">Member since</p>
          <p class="font-medium text-gray-700">{{ formatDate(auth.user?.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="card p-6">
      <h3 class="font-semibold text-gray-900 font-display mb-1">Change Password</h3>
      <p class="text-sm text-gray-500 mb-5">Update your password to keep your account secure.</p>

      <form @submit.prevent="handleChangePassword" novalidate>
        <div class="space-y-4">

          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div class="relative">
              <input v-model="form.currentPassword" :type="showCurrent ? 'text' : 'password'" class="input pr-10" placeholder="Enter current password" />
              <button type="button" @click="showCurrent = !showCurrent"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                {{ showCurrent ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div class="relative">
              <input v-model="form.newPassword" :type="showNew ? 'text' : 'password'" class="input pr-10" placeholder="Min. 6 characters" />
              <button type="button" @click="showNew = !showNew"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                {{ showNew ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <div class="relative">
              <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'"
                class="input pr-10 transition-all"
                :class="form.confirmPassword ? (form.newPassword === form.confirmPassword ? 'border-emerald-400' : 'border-red-400') : ''"
                placeholder="Re-enter new password" />
              <button type="button" @click="showConfirm = !showConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                {{ showConfirm ? '🙈' : '👁️' }}
              </button>
            </div>
            <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="mt-1 text-xs text-red-500">❌ Passwords do not match</p>
            <p v-else-if="form.confirmPassword && form.newPassword === form.confirmPassword" class="mt-1 text-xs text-emerald-600">✅ Passwords match</p>
          </div>

          <!-- Error / Success -->
          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{{ error }}</div>
          <div v-if="success" class="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✅ {{ success }}</div>

          <button type="submit" class="btn-primary py-2.5 px-6" :disabled="loading">
            <span v-if="loading">Updating…</span>
            <span v-else>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../api'

const auth = useAuthStore()

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const error = ref('')
const success = ref('')
const loading = ref(false)

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(d) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

async function handleChangePassword() {
  error.value = ''
  success.value = ''
  if (!form.value.currentPassword) { error.value = 'Please enter your current password.'; return }
  if (form.value.newPassword.length < 6) { error.value = 'New password must be at least 6 characters.'; return }
  if (form.value.newPassword !== form.value.confirmPassword) { error.value = 'New passwords do not match.'; return }

  loading.value = true
  try {
    const res = await api.patch('/auth/change-password', {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
    })
    success.value = res.data.message
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to change password.'
  } finally {
    loading.value = false
  }
}
</script>
