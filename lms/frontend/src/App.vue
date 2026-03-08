<template>
  <div class="min-h-screen bg-surface">
    <Navbar v-if="auth.isLoggedIn" />
    <main :class="auth.isLoggedIn ? 'pt-16' : ''">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './store/auth'

const auth = useAuthStore()
</script>
