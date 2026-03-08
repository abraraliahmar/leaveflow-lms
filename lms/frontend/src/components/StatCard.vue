<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-3">
      <span class="text-2xl">{{ icon }}</span>
      <span :class="`text-xs font-medium px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-700`">
        {{ label }}
      </span>
    </div>
    <p class="text-3xl font-bold text-gray-900 font-display">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  icon: String,
  color: String,
})
</script>
