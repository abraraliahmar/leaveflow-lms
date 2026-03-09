import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useDarkStore = defineStore('dark', () => {
  const isDark = ref(localStorage.getItem('darkMode') === 'true')

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value)
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply on init
  applyTheme()

  return { isDark, toggle }
})
