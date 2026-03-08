<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 font-display">Apply for Leave</h1>
      <p class="text-gray-500 mt-1 text-sm">Fill in the details below to submit your leave request.</p>
    </div>

    <div class="card p-8">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="space-y-6">

          <!-- Leave Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Leave Type *</label>
            <select v-model="form.leaveType" class="input" required>
              <option value="" disabled>Select leave type</option>
              <option v-for="type in leaveTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <p v-if="errors.leaveType" class="mt-1 text-xs text-red-500">{{ errors.leaveType }}</p>
          </div>

          <!-- Date range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
              <input v-model="form.startDate" type="date" class="input" :min="today" required />
              <p v-if="errors.startDate" class="mt-1 text-xs text-red-500">{{ errors.startDate }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
              <input v-model="form.endDate" type="date" class="input" :min="form.startDate || today" required />
              <p v-if="errors.endDate" class="mt-1 text-xs text-red-500">{{ errors.endDate }}</p>
            </div>
          </div>

          <!-- Duration indicator -->
          <div v-if="form.startDate && form.endDate && daysCount > 0" class="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 rounded-lg px-4 py-3">
            <span>📆</span>
            <span>This is a <strong>{{ daysCount }}-day</strong> leave request</span>
          </div>

          <!-- Reason -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Reason *
              <span class="text-gray-400 font-normal">(min. 10 characters)</span>
            </label>
            <textarea
              v-model="form.reason"
              rows="4"
              class="input resize-none"
              placeholder="Please describe your reason for leave…"
              maxlength="500"
            ></textarea>
            <div class="flex justify-between mt-1">
              <p v-if="errors.reason" class="text-xs text-red-500">{{ errors.reason }}</p>
              <p class="text-xs text-gray-400 ml-auto">{{ form.reason.length }}/500</p>
            </div>
          </div>

          <!-- Global error -->
          <div v-if="submitError" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {{ submitError }}
          </div>

          <!-- Success -->
          <div v-if="success" class="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            ✅ Leave application submitted successfully!
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary flex-1 py-2.5" :disabled="loading">
              <span v-if="loading">Submitting…</span>
              <span v-else>Submit Application</span>
            </button>
            <RouterLink to="/dashboard" class="btn-secondary py-2.5 px-6">Cancel</RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const leaveTypes = [
  { value: 'sick', label: '🤒 Sick Leave' },
  { value: 'casual', label: '🌴 Casual Leave' },
  { value: 'annual', label: '📆 Annual Leave' },
  { value: 'maternity', label: '👶 Maternity Leave' },
  { value: 'paternity', label: '👨‍👶 Paternity Leave' },
  { value: 'unpaid', label: '💸 Unpaid Leave' },
]

const today = new Date().toISOString().split('T')[0]

const form = ref({ leaveType: '', startDate: '', endDate: '', reason: '' })
const errors = ref({})
const submitError = ref('')
const success = ref(false)
const loading = ref(false)

const daysCount = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const diff = new Date(form.value.endDate) - new Date(form.value.startDate)
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
})

function validate() {
  const e = {}
  if (!form.value.leaveType) e.leaveType = 'Please select a leave type'
  if (!form.value.startDate) e.startDate = 'Start date is required'
  if (!form.value.endDate) e.endDate = 'End date is required'
  if (form.value.startDate && form.value.endDate && form.value.endDate < form.value.startDate) {
    e.endDate = 'End date must be after start date'
  }
  if (form.value.reason.trim().length < 10) e.reason = 'Reason must be at least 10 characters'
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSubmit() {
  submitError.value = ''
  success.value = false
  if (!validate()) return

  loading.value = true
  try {
    await api.post('/leaves', form.value)
    success.value = true
    form.value = { leaveType: '', startDate: '', endDate: '', reason: '' }
    setTimeout(() => router.push('/leaves'), 1500)
  } catch (err) {
    if (err.response?.data?.errors) {
      err.response.data.errors.forEach(e => { errors.value[e.path] = e.msg })
    } else {
      submitError.value = err.response?.data?.message || 'Failed to submit application.'
    }
  } finally {
    loading.value = false
  }
}
</script>
