<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-display">
        Good {{ timeOfDay }}, {{ auth.user?.name?.split(' ')[0] }} 👋
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
        {{ auth.isEmployer ? "Manage your team's leave requests." : 'Track and manage your leave applications.' }}
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total" :value="stats.total" icon="📋" color="blue" />
      <StatCard label="Pending" :value="stats.pending" icon="⏳" color="amber" />
      <StatCard label="Approved" :value="stats.approved" icon="✅" color="emerald" />
      <StatCard label="Rejected" :value="stats.rejected" icon="❌" color="red" />
    </div>

    <!-- Leave Balance (employees only) -->
    <LeaveBalance v-if="auth.isEmployee" />

    <!-- Quick actions -->
    <div class="flex gap-3 mb-8">
      <RouterLink v-if="auth.isEmployee" to="/apply" class="btn-primary">＋ Apply for Leave</RouterLink>
      <RouterLink to="/leaves" class="btn-secondary">View {{ auth.isEmployer ? 'All Requests' : 'My Leaves' }}</RouterLink>
      <RouterLink v-if="auth.isEmployer" to="/reports" class="btn-secondary">📊 Reports</RouterLink>
    </div>

    <!-- Recent leaves -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 class="font-semibold text-gray-900 dark:text-white font-display">Recent Requests</h2>
        <RouterLink to="/leaves" class="text-xs text-primary-600 hover:underline">View all →</RouterLink>
      </div>
      <div v-if="loading" class="py-12 text-center text-gray-400 text-sm">Loading…</div>
      <div v-else-if="recentLeaves.length === 0" class="py-12 text-center text-gray-400 text-sm">No leave applications yet.</div>
      <div v-else class="divide-y divide-gray-50 dark:divide-gray-800">
        <div v-for="leave in recentLeaves" :key="leave._id" class="px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
              {{ getInitials(leave.employee?.name) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ auth.isEmployer ? leave.employee?.name : formatLeaveType(leave.leaveType) }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ formatDate(leave.startDate) }} – {{ formatDate(leave.endDate) }} · {{ leave.totalDays }} day{{ leave.totalDays !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <span :class="`badge-${leave.status}`">{{ leave.status }}</span>
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
import StatCard from '../components/StatCard.vue'
import LeaveBalance from '../components/LeaveBalance.vue'

const auth = useAuthStore()
const leaves = ref([])
const loading = ref(true)

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const stats = computed(() => ({
  total: leaves.value.length,
  pending: leaves.value.filter(l => l.status === 'pending').length,
  approved: leaves.value.filter(l => l.status === 'approved').length,
  rejected: leaves.value.filter(l => l.status === 'rejected').length,
}))
const recentLeaves = computed(() => leaves.value.slice(0, 5))

function getInitials(name = '') { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
function formatLeaveType(type) { return type?.charAt(0).toUpperCase() + type?.slice(1) + ' Leave' }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

onMounted(async () => {
  try {
    const res = await api.get('/leaves')
    leaves.value = res.data.leaves
  } catch (e) { console.error(e) } finally { loading.value = false }
})
</script>
