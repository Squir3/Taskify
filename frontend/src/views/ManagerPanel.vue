<template>
  <div class="manager-panel-container">
    <h2 class="text-2xl font-bold mb-4">Panel managera</h2>
    <div class="tabs">
      <button :class="{ active: tab === 'teams' }" @click="tab = 'teams'">Moje zespoły</button>
      <button :class="{ active: tab === 'projects' }" @click="tab = 'projects'">
        Moje projekty
      </button>
      <button :class="{ active: tab === 'tasks' }" @click="tab = 'tasks'">Zadania zespołu</button>
    </div>
    <div v-if="tab === 'teams'">
      <h3 class="text-lg font-semibold mb-2">Moje zespoły</h3>
      <TeamForm
        v-if="showTeamForm"
        @close="showTeamForm = false"
        @saved="fetchTeams"
        :editTeam="editingTeam"
      />
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
                {{
                  team.members
                    .map((m) => {
                      const user = users.find((u) => u._id === m)
                      return user ? `${user.email} [${user.role}]` : m
                    })
                    .join(', ')
                }}
              </td>
              <td>
                <button @click="editTeam(team)" class="edit-btn">Edytuj</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="tab === 'projects'">
      <h3 class="text-lg font-semibold mb-2">Moje projekty</h3>
      <ProjectForm
        v-if="showProjectForm"
        @close="showProjectForm = false"
        @saved="fetchProjects"
        :editProject="editingProject"
        :users="users"
        :teams="teams"
      />
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
                {{
                  Array.from(
                    new Set([
                      ...(project.members || []),
                      ...(project.teamId
                        ? teams.find((t) => t._id === project.teamId)?.members || []
                        : []),
                    ]),
                  )
                    .map((m) => {
                      const user = users.find((u) => u._id === m)
                      return user ? user.email : m
                    })
                    .join(', ')
                }}
              </td>
              <td>{{ (teams.find((t) => t._id === project.teamId) || {}).name || '-' }}</td>
              <td>
                <button @click="editProject(project)" class="edit-btn">Edytuj</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="tab === 'tasks'">
      <h3 class="text-lg font-semibold mb-2">Zadania zespołu</h3>
      <TaskForm
        v-if="showTaskForm"
        @close="showTaskForm = false"
        @saved="fetchTasks"
        :editTask="editingTask"
      />
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
                <button @click="editTask(task)" class="edit-btn">Edytuj</button>
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
import TeamForm from '../components/TeamForm.vue'
import ProjectForm from '../components/ProjectForm.vue'
import TaskForm from '../components/TaskForm.vue'

const tab = ref('teams')
const users = ref([])
const teams = ref([])
const projects = ref([])
const tasks = ref([])
const teamsLoading = ref(false)
const projectsLoading = ref(false)
const tasksLoading = ref(false)
const showTeamForm = ref(false)
const editingTeam = ref(null)
const showProjectForm = ref(false)
const editingProject = ref(null)
const showTaskForm = ref(false)
const editingTask = ref(null)

const fetchUsers = async () => {
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch {
    users.value = []
  }
}
const fetchTeams = async () => {
  teamsLoading.value = true
  try {
    const res = await api.get('/teams')
    // Filtrowanie: tylko zespoły, gdzie manager jest członkiem lub właścicielem
    const token = localStorage.getItem('token')
    let managerId = ''
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        managerId = payload.userId || payload.sub || payload._id || ''
      } catch {
        /* ignore */
      }
    }
    teams.value = res.data.filter((team) => team.members.includes(managerId))
  } finally {
    teamsLoading.value = false
  }
}
const fetchProjects = async () => {
  projectsLoading.value = true
  try {
    const res = await api.get('/projects')
    // Filtrowanie: tylko projekty, gdzie manager jest członkiem lub jego zespół jest przypisany
    const token = localStorage.getItem('token')
    let managerId = ''
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        managerId = payload.userId || payload.sub || payload._id || ''
      } catch {
        /* ignore */
      }
    }
    // Zbierz ID zespołów managera
    const managerTeams = teams.value.map((t) => t._id)
    projects.value = res.data.filter(
      (project) =>
        (project.members && project.members.includes(managerId)) ||
        (project.teamId && managerTeams.includes(project.teamId)),
    )
  } finally {
    projectsLoading.value = false
  }
}
const fetchTasks = async () => {
  tasksLoading.value = true
  try {
    const res = await api.get('/tasks')
    // Filtrowanie: tylko zadania przypisane do managera lub jego zespołów
    const token = localStorage.getItem('token')
    let managerId = ''
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        managerId = payload.userId || payload.sub || payload._id || ''
      } catch {
        /* ignore */
      }
    }
    const managerTeams = teams.value.map((t) => t._id)
    tasks.value = res.data.filter(
      (task) =>
        (task.assignedTo && task.assignedTo === managerId) ||
        (task.teamId && managerTeams.includes(task.teamId)),
    )
  } finally {
    tasksLoading.value = false
  }
}
onMounted(() => {
  fetchUsers()
  fetchTeams()
  fetchProjects()
  fetchTasks()
})
function editTeam(team) {
  editingTeam.value = team
  showTeamForm.value = true
}
function editProject(project) {
  editingProject.value = project
  showProjectForm.value = true
}
function editTask(task) {
  editingTask.value = task
  showTaskForm.value = true
}
</script>

<style scoped>
.manager-panel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.tabs button {
  padding: 0.5rem 1.5rem;
  border: none;
  background: #e0e7ef;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.tabs button.active {
  background: #2c3e50;
  color: white;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.admin-table th,
.admin-table td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  text-align: left;
}
.edit-btn {
  background: #2980b9;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
