<template>
  <div class="admin-panel-container">
    <h2 class="text-2xl font-bold mb-4">Panel administracyjny</h2>
    <div class="tabs">
      <button :class="{ active: tab === 'users' }" @click="tab = 'users'">Użytkownicy</button>
      <button :class="{ active: tab === 'teams' }" @click="tab = 'teams'">Zespoły</button>
      <button :class="{ active: tab === 'tasks' }" @click="tab = 'tasks'">Zadania</button>
      <button :class="{ active: tab === 'projects' }" @click="tab = 'projects'">Projekty</button>
    </div>
    <div v-if="tab === 'users'">
      <h3 class="text-lg font-semibold mb-2">Użytkownicy</h3>
      <UserForm v-if="showUserForm" @close="showUserForm = false" @saved="onUserSaved" :editUser="editingUser" />
      <div v-if="usersLoading">Ładowanie...</div>
      <div v-else>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rola</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button @click="editUser(user)" class="edit-btn" v-if="isAdmin">Edytuj</button>
                <button @click="deleteUser(user._id)" class="delete-btn" v-if="isAdmin || isManager">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="tab === 'teams'">
      <h3 class="text-lg font-semibold mb-2">Zespoły</h3>
      <button class="add-btn mb-2" @click="showTeamForm = true" v-if="isAdmin || isManager">Dodaj zespół</button>
      <TeamForm v-if="showTeamForm" @close="showTeamForm = false" @saved="onTeamSaved" :editTeam="editingTeam" />
      <div v-if="teamsLoading">Ładowanie...</div>
      <div v-else>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Członkowie</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team._id">
              <td>{{ team.name }}</td>
              <td>
                {{ team.members.map(m => {
                  const user = users.find(u => u._id === m)
                  return user ? `${user.email} [${user.role}]` : m
                }).join(', ') }}
              </td>
              <td>
                <button @click="editTeam(team)" class="edit-btn" v-if="isAdmin || isManager">Edytuj</button>
                <button @click="deleteTeam(team._id)" class="delete-btn" v-if="isAdmin || isManager">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="tab === 'tasks'">
      <h3 class="text-lg font-semibold mb-2">Zadania</h3>
      <button class="add-btn mb-2" @click="showTaskForm = true" v-if="isAdmin || isManager">Dodaj zadanie</button>
      <TaskForm v-if="showTaskForm" @close="showTaskForm = false" @saved="onTaskSaved" :editTask="editingTask" />
      <div v-if="tasksLoading">Ładowanie...</div>
      <div v-else>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tytuł</th>
              <th>Status</th>
              <th>Priorytet</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task._id">
              <td>{{ task.title }}</td>
              <td>{{ task.status }}</td>
              <td>{{ task.priority }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn" v-if="isAdmin || isManager">Edytuj</button>
                <button @click="deleteTask(task._id)" class="delete-btn" v-if="isAdmin">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="tab === 'projects'">
      <h3 class="text-lg font-semibold mb-2">Projekty</h3>
      <button class="add-btn mb-2" @click="showProjectForm = true" v-if="isAdmin || isManager">Dodaj projekt</button>
      <ProjectForm v-if="showProjectForm" @close="showProjectForm = false" @saved="onProjectSaved" :editProject="editingProject" :users="users" :teams="teams" />
      <div v-if="projectsLoading">Ładowanie...</div>
      <div v-else>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Opis</th>
              <th>Członkowie</th>
              <th>Zespół</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in projects" :key="project._id">
              <td>{{ project.name }}</td>
              <td>{{ project.description }}</td>
              <td>
                {{ Array.from(new Set([
                  ...(project.members || []),
                  ...(project.teamId ? (teams.find(t => t._id === project.teamId)?.members || []) : [])
                ]))
                  .map(m => {
                    const user = users.find(u => u._id === m)
                    return user ? user.email : m
                  })
                  .join(', ') }}
              </td>
              <td>
                {{ (teams.find(t => t._id === project.teamId) || {}).name || '-' }}
              </td>
              <td>
                <button @click="editProject(project)" class="edit-btn" v-if="isAdmin || isManager">Edytuj</button>
                <button @click="deleteProject(project._id)" class="delete-btn" v-if="isAdmin">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import UserForm from '../components/UserForm.vue'
import TeamForm from '../components/TeamForm.vue'
import TaskForm from '../components/TaskForm.vue'
import ProjectForm from '../components/ProjectForm.vue'
import { useToast } from 'vue-toastification'

const tab = ref('users')
const users = ref([])
const teams = ref([])
const tasks = ref([])
const projects = ref([])
const usersLoading = ref(false)
const teamsLoading = ref(false)
const tasksLoading = ref(false)
const projectsLoading = ref(false)
const showUserForm = ref(false)
const editingUser = ref(null)
const showTeamForm = ref(false)
const editingTeam = ref(null)
const showTaskForm = ref(false)
const editingTask = ref(null)
const showProjectForm = ref(false)
const editingProject = ref(null)
const toast = useToast()

const isAdmin = ref(false)
const isManager = ref(false)
const isUser = ref(false)

function checkRole() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    isAdmin.value = payload.role === 'admin'
    isManager.value = payload.role === 'manager'
    isUser.value = payload.role === 'user' || payload.role === 'member'
  } catch { /* ignore */ }
}

const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch (e) {
    handleApiError(e)
  } finally {
    usersLoading.value = false
  }
}
const fetchTeams = async () => {
  teamsLoading.value = true
  try {
    const res = await api.get('/teams')
    teams.value = res.data
  } catch (e) {
    handleApiError(e)
  } finally {
    teamsLoading.value = false
  }
}
const fetchTasks = async () => {
  tasksLoading.value = true
  try {
    const res = await api.get('/tasks')
    tasks.value = res.data
  } catch (e) {
    handleApiError(e)
  } finally {
    tasksLoading.value = false
  }
}
const fetchProjects = async () => {
  projectsLoading.value = true
  try {
    const res = await api.get('/projects')
    projects.value = res.data
  } catch (e) {
    handleApiError(e)
  } finally {
    projectsLoading.value = false
  }
}
const deleteUser = async (id) => {
  if (!confirm('Usunąć użytkownika?')) return
  try {
    await api.delete(`/users/${id}`)
    fetchUsers()
  } catch (e) {
    handleApiError(e)
  }
}
const deleteTeam = async (id) => {
  if (!confirm('Usunąć zespół?')) return
  try {
    await api.delete(`/teams/${id}`)
    fetchTeams()
  } catch (e) {
    handleApiError(e)
  }
}
const deleteTask = async (id) => {
  if (!confirm('Usunąć zadanie?')) return
  try {
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  } catch (e) {
    handleApiError(e)
  }
}
const deleteProject = async (id) => {
  if (!confirm('Usunąć projekt?')) return
  try {
    await api.delete(`/projects/${id}`)
    fetchProjects()
  } catch (e) {
    handleApiError(e)
  }
}
function editUser(user) {
  editingUser.value = user
  showUserForm.value = true
}
function onUserSaved() {
  showUserForm.value = false
  editingUser.value = null
  fetchUsers()
}
function editTeam(team) {
  editingTeam.value = team
  showTeamForm.value = true
}
function onTeamSaved() {
  showTeamForm.value = false
  editingTeam.value = null
  fetchTeams()
}
function editTask(task) {
  editingTask.value = task
  showTaskForm.value = true
}
function onTaskSaved() {
  showTaskForm.value = false
  editingTask.value = null
  fetchTasks()
}
function editProject(project) {
  editingProject.value = project
  showProjectForm.value = true
}
function onProjectSaved() {
  showProjectForm.value = false
  editingProject.value = null
  fetchProjects()
}
function handleApiError(e) {
  if (e.response && (e.response.status === 403 || e.response.status === 401)) {
    toast.error('Brak uprawnień do wykonania tej akcji!')
  } else {
    toast.error('Błąd operacji lub połączenia z serwerem')
  }
}
onMounted(() => {
  checkRole()
  fetchUsers()
  fetchTeams()
  fetchTasks()
  fetchProjects()
  window.addEventListener('storage', checkRole)
})
</script>

<style scoped>
.admin-panel-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.tabs button {
  padding: 0.5rem 1.2rem;
  border: none;
  background: #eaf3fa;
  color: #2c3e50;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
.tabs button.active {
  background: #2980b9;
  color: white;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
.admin-table th,
.admin-table td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.7rem;
  text-align: left;
}
.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
.delete-btn:hover {
  background: #c0392b;
}
.add-btn {
  background: #2980b9;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.7rem;
}
.add-btn:hover {
  background: #1a232e;
}
.edit-btn {
  color: #2980b9;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  padding: 0.2rem 0.7rem;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #eaf3fa;
}
</style>
