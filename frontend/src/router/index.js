import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProjectView from '../views/ProjectView.vue'
import AuthView from '../views/AuthView.vue'
import TaskView from '../components/TaskView.vue'
import ProfileView from '../views/ProfileView.vue'
import TasksView from '../views/TasksView.vue'

const routes = [
  { path: '/', component: DashboardView },
  { path: '/project/:id', component: ProjectView, props: true },
  { path: '/auth', component: AuthView },
  { path: '/task/:id', component: TaskView, props: true },
  { path: '/profile', component: ProfileView },
  { path: '/tasks', component: TasksView },
  { path: '/projects', component: () => import('../components/ProjectList.vue') },
  { path: '/dashboard', component: DashboardView },
  { path: '/admin', component: () => import('../views/AdminPanel.vue') },
  { path: '/manager', component: () => import('../views/ManagerPanel.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
