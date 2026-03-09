<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-display">Reports & Analytics</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Visual overview of all leave requests across your organization.</p>
      </div>
      <button @click="exportPDF" class="btn-primary gap-2">
        📄 Export PDF Report
      </button>
    </div>

    <div v-if="loading" class="py-20 text-center text-gray-400">Loading analytics…</div>

    <div v-else id="report-content">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-5 text-center">
          <p class="text-3xl font-bold text-gray-900 dark:text-white font-display">{{ stats.total }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Requests</p>
        </div>
        <div class="card p-5 text-center">
          <p class="text-3xl font-bold text-amber-500 font-display">{{ stats.byStatus?.pending || 0 }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pending</p>
        </div>
        <div class="card p-5 text-center">
          <p class="text-3xl font-bold text-emerald-500 font-display">{{ stats.byStatus?.approved || 0 }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Approved</p>
        </div>
        <div class="card p-5 text-center">
          <p class="text-3xl font-bold text-red-500 font-display">{{ stats.byStatus?.rejected || 0 }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rejected</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <!-- Status Donut Chart -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white font-display mb-4">Requests by Status</h3>
          <div class="flex items-center gap-6">
            <div class="relative w-36 h-36 flex-shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3" />
                <circle v-if="donut.approved" cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" stroke-width="3"
                  :stroke-dasharray="`${donut.approved} ${100 - donut.approved}`" stroke-dashoffset="0" />
                <circle v-if="donut.rejected" cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" stroke-width="3"
                  :stroke-dasharray="`${donut.rejected} ${100 - donut.rejected}`"
                  :stroke-dashoffset="`${-(donut.approved)}`" />
                <circle v-if="donut.pending" cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" stroke-width="3"
                  :stroke-dasharray="`${donut.pending} ${100 - donut.pending}`"
                  :stroke-dashoffset="`${-(donut.approved + donut.rejected)}`" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-900 dark:text-white font-display">{{ stats.total }}</span>
              </div>
            </div>
            <div class="space-y-2 flex-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span class="text-sm text-gray-600 dark:text-gray-400">Approved</span></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stats.byStatus?.approved || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-amber-500"></div><span class="text-sm text-gray-600 dark:text-gray-400">Pending</span></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stats.byStatus?.pending || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-sm text-gray-600 dark:text-gray-400">Rejected</span></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stats.byStatus?.rejected || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Type Bar Chart -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white font-display mb-4">Requests by Leave Type</h3>
          <div class="space-y-3">
            <div v-for="(count, type) in stats.byType" :key="type">
              <div class="flex justify-between text-sm mb-1">
                <span class="capitalize text-gray-600 dark:text-gray-400 font-medium">{{ type }}</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{ count }}</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div class="h-2 rounded-full bg-primary-500 transition-all duration-700"
                  :style="{ width: `${(count / stats.total) * 100}%` }"></div>
              </div>
            </div>
            <p v-if="!stats.byType || Object.keys(stats.byType).length === 0" class="text-sm text-gray-400 text-center py-4">No data yet</p>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="card p-6 mb-6">
        <h3 class="font-semibold text-gray-900 dark:text-white font-display mb-4">Monthly Trend</h3>
        <div v-if="monthlyData.length > 0" class="flex items-end gap-2 h-32">
          <div v-for="item in monthlyData" :key="item.month" class="flex-1 flex flex-col items-center gap-1">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ item.count }}</span>
            <div class="w-full bg-primary-500 rounded-t-md transition-all duration-700 hover:bg-primary-600"
              :style="{ height: `${maxMonthly > 0 ? (item.count / maxMonthly) * 100 : 0}%`, minHeight: item.count > 0 ? '8px' : '2px' }">
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ item.month }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-8">No monthly data yet</p>
      </div>

      <!-- All Leaves Table -->
      <div class="card overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white font-display">All Leave Records</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
              <tr v-for="leave in leaves" :key="leave._id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="px-6 py-3 font-medium text-gray-900 dark:text-white">{{ leave.employee?.name }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-400 capitalize">{{ leave.leaveType }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-400">{{ formatDate(leave.startDate) }} – {{ formatDate(leave.endDate) }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-400">{{ leave.totalDays }}d</td>
                <td class="px-6 py-3"><span :class="`badge-${leave.status}`">{{ leave.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useToastStore } from '../store/toast'

const toast = useToastStore()
const loading = ref(true)
const stats = ref({ total: 0, byStatus: {}, byType: {}, byMonth: {} })
const leaves = ref([])

const donut = computed(() => {
  const t = stats.value.total || 1
  return {
    approved: ((stats.value.byStatus?.approved || 0) / t) * 100,
    rejected: ((stats.value.byStatus?.rejected || 0) / t) * 100,
    pending: ((stats.value.byStatus?.pending || 0) / t) * 100,
  }
})

const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const monthlyData = computed(() => {
  return monthOrder
    .filter(m => stats.value.byMonth?.[m] !== undefined)
    .map(m => ({ month: m, count: stats.value.byMonth[m] || 0 }))
})
const maxMonthly = computed(() => Math.max(...monthlyData.value.map(m => m.count), 1))

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function exportPDF() {
  toast.info('Generating PDF report...')
  try {
    const { default: jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm')
    const doc = new jsPDF()

    // Header
    doc.setFillColor(79, 110, 247)
    doc.rect(0, 0, 210, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('LeaveFlow', 14, 16)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Leave Management System — Full Report', 14, 24)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 31)

    // Summary
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, 48)

    const summaryData = [
      ['Total Requests', stats.value.total],
      ['Approved', stats.value.byStatus?.approved || 0],
      ['Pending', stats.value.byStatus?.pending || 0],
      ['Rejected', stats.value.byStatus?.rejected || 0],
    ]
    summaryData.forEach(([label, value], i) => {
      const x = 14 + (i * 48)
      doc.setFillColor(248, 249, 252)
      doc.roundedRect(x, 52, 44, 22, 2, 2, 'F')
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(79, 110, 247)
      doc.text(String(value), x + 22, 64, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(label, x + 22, 70, { align: 'center' })
    })

    // Leave by type
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Requests by Leave Type', 14, 88)
    let y = 94
    Object.entries(stats.value.byType || {}).forEach(([type, count]) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)
      doc.text(type.charAt(0).toUpperCase() + type.slice(1), 14, y + 4)
      doc.setFillColor(229, 231, 235)
      doc.rect(60, y, 100, 6, 'F')
      doc.setFillColor(79, 110, 247)
      doc.rect(60, y, (count / (stats.value.total || 1)) * 100, 6, 'F')
      doc.setTextColor(55, 65, 81)
      doc.text(String(count), 165, y + 4)
      y += 12
    })

    // Leave records table
    y += 8
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Leave Records', 14, y)
    y += 8

    // Table header
    doc.setFillColor(79, 110, 247)
    doc.rect(14, y, 182, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Employee', 16, y + 5.5)
    doc.text('Type', 66, y + 5.5)
    doc.text('Start Date', 96, y + 5.5)
    doc.text('End Date', 130, y + 5.5)
    doc.text('Days', 162, y + 5.5)
    doc.text('Status', 176, y + 5.5)
    y += 8

    leaves.value.forEach((leave, i) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 252)
      doc.rect(14, y, 182, 8, 'F')
      doc.setTextColor(55, 65, 81)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text((leave.employee?.name || '').substring(0, 18), 16, y + 5.5)
      doc.text((leave.leaveType || '').charAt(0).toUpperCase() + (leave.leaveType || '').slice(1), 66, y + 5.5)
      doc.text(formatDate(leave.startDate), 96, y + 5.5)
      doc.text(formatDate(leave.endDate), 130, y + 5.5)
      doc.text(String(leave.totalDays || 0), 164, y + 5.5)
      const statusColors = { approved: [16, 185, 129], pending: [245, 158, 11], rejected: [239, 68, 68] }
      const sc = statusColors[leave.status] || [100, 116, 139]
      doc.setTextColor(...sc)
      doc.setFont('helvetica', 'bold')
      doc.text((leave.status || '').toUpperCase(), 176, y + 5.5)
      y += 8
    })

    // Footer
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('LeaveFlow — Confidential HR Report', 105, 290, { align: 'center' })

    doc.save(`LeaveFlow-Report-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF report downloaded!')
  } catch (err) {
    console.error(err)
    toast.error('Failed to generate PDF.')
  }
}

onMounted(async () => {
  try {
    const [statsRes, leavesRes] = await Promise.all([
      api.get('/leaves/stats'),
      api.get('/leaves'),
    ])
    stats.value = statsRes.data
    leaves.value = leavesRes.data.leaves
  } catch (e) {
    toast.error('Failed to load report data.')
  } finally {
    loading.value = false
  }
})
</script>
