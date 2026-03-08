<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/dashboard" class="flex items-center gap-2">
        <span class="text-2xl">📅</span>
        <span class="font-display font-700 text-lg text-gray-900">LeaveFlow</span>
      </RouterLink>

      <!-- Nav links -->
      <div class="flex items-center gap-1">
        <RouterLink to="/dashboard" class="nav-link" active-class="nav-link-active">
          Dashboard
        </RouterLink>
        <RouterLink to="/leaves" class="nav-link" active-class="nav-link-active">
          {{ auth.isEmployer ? 'All Requests' : 'My Leaves' }}
        </RouterLink>
        <RouterLink v-if="auth.isEmployee" to="/apply" class="nav-link" active-class="nav-link-active">
          Apply
        </RouterLink>
      </div>

      <!-- User menu -->
      <div class="flex items-center gap-3">
        <RouterLink to="/profile" class="text-right hidden sm:block hover:opacity-80 transition-opacity">
          <p class="text-sm font-medium text-gray-900">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ auth.user?.role }} · My Profile</p>
        </RouterLink>
        <button @click="handleLogout" class="btn-secondary text-xs py-1.5">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all;
}
.nav-link-active {
  @apply text-primary-600 bg-primary-50 hover:bg-primary-50 hover:text-primary-600;
}
</style>
