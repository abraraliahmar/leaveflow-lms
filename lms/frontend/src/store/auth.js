import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isEmployee = computed(() => user.value?.role === 'employee')
  const isEmployer = computed(() => user.value?.role === 'employer')

  // Register — does NOT auto login, just returns success
  async function register(data) {
    const res = await api.post('/auth/register', data)
    return res.data
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    setAuth(res.data.token, res.data.user)
    return res.data
  }

  function setAuth(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, isEmployee, isEmployer, register, login, logout }
})
