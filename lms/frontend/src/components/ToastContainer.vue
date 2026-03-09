<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto max-w-sm',
          toast.type === 'success' ? 'bg-emerald-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-primary-600 text-white'
        ]"
      >
        <span class="text-lg flex-shrink-0">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="toastStore.remove(toast.id)" class="opacity-70 hover:opacity-100 ml-2 text-lg leading-none">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../store/toast'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
