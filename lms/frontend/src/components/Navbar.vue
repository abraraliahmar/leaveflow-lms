<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/dashboard" class="flex items-center gap-2">
        <span class="text-2xl">📅</span>
        <span class="font-display font-bold text-lg text-gray-900 dark:text-white">LeaveFlow</span>
      </RouterLink>

      <!-- Nav links -->
      <div class="flex items-center gap-1">
        <RouterLink to="/dashboard" class="nav-link" active-class="nav-link-active">Dashboard</RouterLink>
        <RouterLink to="/leaves" class="nav-link" active-class="nav-link-active">
          {{ auth.isEmployer ? 'All Requests' : 'My Leaves' }}
        </RouterLink>
        <RouterLink v-if="auth.isEmployee" to="/apply" class="nav-link" active-class="nav-link-active">Apply</RouterLink>
        <RouterLink v-if="auth.isEmployer" to="/reports" class="nav-link" active-class="nav-link-active">Reports</RouterLink>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-2">
        <!-- Dark mode toggle -->
        <button @click="dark.toggle()"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :title="dark.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          {{ dark.isDark ? '☀️' : '🌙' }}
        </button>

        <RouterLink to="/profile" class="text-right hidden sm:block hover:opacity-80 transition-opacity">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ auth.user?.role }}</p>
        </RouterLink>
        <button @click="handleLogout" class="btn-secondary text-xs py-1.5">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useDarkStore } from '../store/dark'

const auth = useAuthStore()
const dark = useDarkStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all;
}
.nav-link-active {
@apply text-blue-600 bg-blue-50 hover:bg-blue-50 hover:text-blue-600;
}
</style>
