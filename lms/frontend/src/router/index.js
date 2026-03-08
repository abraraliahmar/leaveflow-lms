import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/apply',
    component: () => import('../views/ApplyLeave.vue'),
    meta: { requiresAuth: true, role: 'employee' },
  },
  {
    path: '/leaves',
    component: () => import('../views/LeaveList.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return next('/dashboard')
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return next('/dashboard')
  }

  next()
})

export default router
