<template>
  <div class="teams-container">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Zespoły</h2>
      <button v-if="canEdit" @click="showForm = true" class="add-btn">Dodaj zespół</button>
    </div>
    <div v-if="loading" class="loading">Ładowanie zespołów...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error && teams.length === 0" class="text-gray-500">Brak zespołów.</div>
    <div v-for="team in teams" :key="team._id" class="team-card">
      <div class="flex justify-between items-center">
        <div>
          <span class="font-bold">{{ team.name }}</span>
          <span class="ml-2 text-gray-600">({{ team.members.length }} członków)</span>
        </div>
        <button v-if="canEdit" @click="editTeam(team)" class="edit-btn">Edytuj</button>
      </div>
      <div class="mt-2">
        <strong>Członkowie:</strong>
        <span v-if="team.members.length === 0">Brak</span>
        <span v-else>{{ team.members.map(u => u.email).join(', ') }}</span>
      </div>
      <button class="report-btn mt-2" @click="showReport(team._id)">Pokaż raport</button>
      <div v-if="activeReportTeam === team._id" class="mt-2">
        <div v-if="report">
          <h4 class="font-semibold">Raport zespołu</h4>
          <pre class="bg-gray-100 p-2 rounded">{{ report }}</pre>
        </div>
        <div v-else>Ładowanie raportu...</div>
      </div>
    </div>
    <TeamForm v-if="showForm" :editTeam="editingTeam" @close="closeForm" @saved="onTeamSaved" />
    <!-- Modal do dodawania/edycji zespołu można dodać tutaj -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import TeamForm from '../components/TeamForm.vue'

const teams = ref([])
const canEdit = ref(false)
const showForm = ref(false)
const activeReportTeam = ref(null)
const report = ref('')
const loading = ref(false)
const error = ref('')
const editingTeam = ref(null)

const getRole = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch {
    return null
  }
}

const fetchTeams = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/teams')
    teams.value = res.data
  } catch {
    error.value = 'Błąd pobierania zespołów'
    teams.value = []
  } finally {
    loading.value = false
  }
}

const showReport = async (teamId) => {
  activeReportTeam.value = teamId
  report.value = ''
  try {
    const res = await api.get(`/teams/${teamId}/report`)
    report.value = JSON.stringify(res.data, null, 2)
  } catch {
    report.value = 'Błąd pobierania raportu'
  }
}

const editTeam = (team) => {
  editingTeam.value = team
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingTeam.value = null
}

const onTeamSaved = () => {
  closeForm()
  fetchTeams()
}

onMounted(() => {
  fetchTeams()
  const role = getRole()
  canEdit.value = role === 'admin' || role === 'manager'
})
</script>

<style scoped>
.loading {
  color: #2980b9;
  font-weight: bold;
  margin-bottom: 1rem;
}
.error {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
}
.teams-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.team-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.10);
  padding: 1.2rem 1rem;
  margin-bottom: 1.2rem;
  transition: box-shadow 0.2s;
}
.team-card:hover {
  box-shadow: 0 4px 24px rgba(44, 62, 80, 0.18);
}
.add-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
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
.report-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.3rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.report-btn:hover {
  background: #219150;
}
</style>
