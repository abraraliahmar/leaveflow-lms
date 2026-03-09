<template>
  <div :class="['min-h-screen transition-colors duration-200', dark.isDark ? 'dark bg-gray-950' : 'bg-surface']">
    <Navbar v-if="auth.isLoggedIn" />
    <ToastContainer />
    <main :class="auth.isLoggedIn ? 'pt-16' : ''">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAuthStore } from './store/auth'
import { useDarkStore } from './store/dark'

const auth = useAuthStore()
const dark = useDarkStore()
</script>
