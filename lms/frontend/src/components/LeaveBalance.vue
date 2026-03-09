<template>
  <div class="card p-6 mb-6">
    <h2 class="font-semibold text-gray-900 dark:text-white font-display mb-4">📊 Leave Balance — {{ currentYear }}</h2>
    <div v-if="loading" class="text-sm text-gray-400">Loading balance…</div>
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="(data, type) in balance" :key="type" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{{ type }}</span>
          <span class="text-xs text-gray-400">{{ data.remaining }}/{{ data.total }} days left</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
          <div
            class="h-2 rounded-full transition-all duration-700"
            :class="data.remaining === 0 ? 'bg-red-500' : data.remaining <= data.total * 0.3 ? 'bg-amber-500' : 'bg-emerald-500'"
            :style="{ width: `${Math.max(0, (data.remaining / data.total) * 100)}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-400">{{ data.used }} used · {{ data.remaining }} remaining</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const balance = ref({})
const loading = ref(true)
const currentYear = new Date().getFullYear()

onMounted(async () => {
  try {
    const res = await api.get('/leaves/balance')
    balance.value = res.data.balance
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
