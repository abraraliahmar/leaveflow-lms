<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 font-display">
          {{ auth.isEmployer ? 'All Leave Requests' : 'My Leave Applications' }}
        </h1>
        <p class="text-gray-500 mt-1 text-sm">
          {{ auth.isEmployer ? 'Review and manage employee leave requests.' : 'Track all your submitted leave applications.' }}
        </p>
      </div>
      <RouterLink v-if="auth.isEmployee" to="/apply" class="btn-primary">＋ Apply</RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        @click="activeStatus = f.value"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
          activeStatus === f.value
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
        ]"
      >
        {{ f.label }} ({{ counts[f.value] ?? total }})
      </button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="py-16 text-center text-gray-400">Loading…</div>
      <div v-else-if="filteredLeaves.length === 0" class="py-16 text-center text-gray-400">
        <p class="text-4xl mb-3">📭</p>
        <p class="text-sm">No leave applications found.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th v-if="auth.isEmployer" class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="leave in filteredLeaves" :key="leave._id" class="hover:bg-gray-50 transition-colors">
              <td v-if="auth.isEmployer" class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                    {{ getInitials(leave.employee?.name) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ leave.employee?.name }}</p>
                    <p class="text-xs text-gray-400">{{ leave.employee?.department || leave.employee?.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-gray-800 capitalize">{{ leave.leaveType }}</td>
              <td class="px-6 py-4 text-gray-600">
                {{ formatDate(leave.startDate) }}<br/>
                <span class="text-xs text-gray-400">to {{ formatDate(leave.endDate) }}</span>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ leave.totalDays }}d</td>
              <td class="px-6 py-4">
                <span :class="`badge-${leave.status}`">{{ leave.status }}</span>
              </td>
              <td class="px-6 py-4 text-gray-400 text-xs">{{ formatDate(leave.createdAt) }}</td>
              <td class="px-6 py-4">
                <!-- Employer actions -->
                <div v-if="auth.isEmployer && leave.status === 'pending'" class="flex gap-2">
                  <button @click="review(leave._id, 'approved')" class="btn-success py-1 px-3 text-xs">
                    Approve
                  </button>
                  <button @click="openReject(leave)" class="btn-danger py-1 px-3 text-xs">
                    Reject
                  </button>
                </div>
                <!-- Employee: delete pending -->
                <button
                  v-if="auth.isEmployee && leave.status === 'pending'"
                  @click="deleteLeave(leave._id)"
                  class="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Withdraw
                </button>
                <!-- Review note tooltip -->
                <span v-if="leave.reviewNote" :title="leave.reviewNote" class="text-xs text-gray-400 cursor-help">💬 Note</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject modal -->
    <div v-if="rejectModal.show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="card p-6 w-full max-w-md">
        <h3 class="font-semibold text-gray-900 font-display mb-4">Reject Leave Request</h3>
        <p class="text-sm text-gray-600 mb-4">
          Rejecting leave for <strong>{{ rejectModal.leave?.employee?.name }}</strong>.
          Optionally add a note.
        </p>
        <textarea
          v-model="rejectModal.note"
          class="input resize-none"
          rows="3"
          placeholder="Reason for rejection (optional)…"
          maxlength="300"
        ></textarea>
        <div class="flex gap-3 mt-4">
          <button @click="confirmReject" class="btn-danger flex-1" :disabled="rejectModal.loading">
            {{ rejectModal.loading ? 'Rejecting…' : 'Confirm Reject' }}
          </button>
          <button @click="rejectModal.show = false" class="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../api'

const auth = useAuthStore()
const leaves = ref([])
const loading = ref(true)
const activeStatus = ref('all')

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const rejectModal = ref({ show: false, leave: null, note: '', loading: false })

const total = computed(() => leaves.value.length)
const counts = computed(() => ({
  pending: leaves.value.filter(l => l.status === 'pending').length,
  approved: leaves.value.filter(l => l.status === 'approved').length,
  rejected: leaves.value.filter(l => l.status === 'rejected').length,
}))

const filteredLeaves = computed(() =>
  activeStatus.value === 'all' ? leaves.value : leaves.value.filter(l => l.status === activeStatus.value)
)

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchLeaves() {
  loading.value = true
  try {
    const res = await api.get('/leaves')
    leaves.value = res.data.leaves
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function review(id, status, note = '') {
  try {
    await api.patch(`/leaves/${id}/review`, { status, reviewNote: note })
    await fetchLeaves()
  } catch (e) {
    alert(e.response?.data?.message || 'Action failed')
  }
}

function openReject(leave) {
  rejectModal.value = { show: true, leave, note: '', loading: false }
}

async function confirmReject() {
  rejectModal.value.loading = true
  await review(rejectModal.value.leave._id, 'rejected', rejectModal.value.note)
  rejectModal.value.show = false
  rejectModal.value.loading = false
}

async function deleteLeave(id) {
  if (!confirm('Withdraw this leave application?')) return
  try {
    await api.delete(`/leaves/${id}`)
    await fetchLeaves()
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to withdraw')
  }
}

onMounted(fetchLeaves)
</script>
