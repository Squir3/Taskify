<template>
  <div class="task-view-container" v-if="!loading && task">
    <h3 class="text-xl font-bold mb-2">{{ task.title }}</h3>
    <div class="mb-2 text-gray-600">{{ task.description }}</div>
    <div class="mb-2">
      <span class="status" :class="task.status">{{ task.status }}</span>
      <span class="priority">{{ task.priority }}</span>
    </div>
    <div class="mb-2">
      <strong>Przypisany do:</strong> {{ task.assignedToUser?.email || 'Brak' }}
    </div>
    <div class="mb-4">
      <strong>Notatki prywatne:</strong>
      <ul>
        <li v-for="note in notes" :key="note._id">
          📝
          <template v-if="editingNoteId === note._id">
            <textarea v-model="editingNoteContent" rows="2" style="width: 80%"></textarea>
            <label><input type="checkbox" v-model="editingNoteTeamVisible" /> Widoczna dla zespołu</label>
            <button class="save-btn" @click="saveEditedNote(note)">Zapisz</button>
            <button class="cancel-btn" @click="cancelEditNote">Anuluj</button>
          </template>
          <template v-else>
            {{ note.content }}
            <span v-if="note.teamVisible" style="color:#2980b9; font-size:0.9em; margin-left:0.5em;">[dla zespołu]</span>
            <button v-if="canEditNote(note)" class="edit-btn" @click="editNote(note)">Edytuj</button>
            <button
              v-if="canEditNote(note)"
              class="delete-btn"
              @click="openDeleteModal('note', note._id)"
            >
              Usuń
            </button>
          </template>
        </li>
      </ul>
    </div>
    <div class="mb-4">
      <strong>Komentarze:</strong>
      <ul>
        <li v-for="comment in comments" :key="comment._id">
          💬
          <template v-if="editingCommentId === comment._id">
            <textarea v-model="editingCommentContent" rows="2" style="width: 80%"></textarea>
            <button class="save-btn" @click="saveEditedComment(comment)">Zapisz</button>
            <button class="cancel-btn" @click="cancelEditComment">Anuluj</button>
          </template>
          <template v-else>
            {{ comment.content }}
            <button v-if="canEditComment(comment)" class="edit-btn" @click="editComment(comment)">Edytuj</button>
            <button
              v-if="canEditComment(comment)"
              class="delete-btn"
              @click="openDeleteModal('comment', comment._id)"
            >
              Usuń
            </button>
          </template>
        </li>
      </ul>
    </div>
    <div class="mb-2">
      <button class="add-btn" @click="showCommentForm = !showCommentForm">Dodaj komentarz</button>
      <button class="add-btn" @click="showNoteForm = !showNoteForm">Dodaj notatkę</button>
    </div>
    <div v-if="showCommentForm" class="mb-2">
      <textarea v-model="newComment" placeholder="Treść komentarza" rows="2"></textarea>
      <button class="save-btn" @click="addComment">Dodaj komentarz</button>
    </div>
    <div v-if="showNoteForm" class="mb-2">
      <textarea v-model="newNote" placeholder="Treść notatki" rows="2"></textarea>
      <label><input type="checkbox" v-model="noteTeamVisible" /> Widoczna dla zespołu</label>
      <button class="save-btn" @click="addNote">Dodaj notatkę</button>
    </div>
    <ConfirmModal
      v-if="showDeleteModal"
      :title="'Potwierdź usunięcie'"
      :message="deleteModalMsg"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
  <div v-else-if="loading" class="loading">Ładowanie zadania...</div>
  <div v-else class="error">{{ error }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useRoute } from 'vue-router'
import ConfirmModal from './ConfirmModal.vue'

const route = useRoute()
const taskId = route.params.id
const task = ref(null)
const comments = ref([])
const notes = ref([])
const showCommentForm = ref(false)
const showNoteForm = ref(false)
const newComment = ref('')
const newNote = ref('')
const noteTeamVisible = ref(false)
const loading = ref(false)
const error = ref('')
const userId = ref('')

// Modal potwierdzenia usuwania
const showDeleteModal = ref(false)
const deleteType = ref('')
const deleteId = ref('')
const deleteModalMsg = ref('')

function openDeleteModal(type, id) {
  deleteType.value = type
  deleteId.value = id
  deleteModalMsg.value =
    type === 'comment'
      ? 'Czy na pewno chcesz usunąć ten komentarz?'
      : 'Czy na pewno chcesz usunąć tę notatkę?'
  showDeleteModal.value = true
}
function closeDeleteModal() {
  showDeleteModal.value = false
  deleteType.value = ''
  deleteId.value = ''
  deleteModalMsg.value = ''
}
async function confirmDelete() {
  if (deleteType.value === 'comment') {
    await deleteComment(deleteId.value, true)
  } else if (deleteType.value === 'note') {
    await deleteNote(deleteId.value, true)
  }
  closeDeleteModal()
}

const fetchTask = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`/tasks/${taskId}`)
    task.value = res.data
  } catch {
    error.value = 'Błąd pobierania zadania'
  } finally {
    loading.value = false
  }
}
const fetchComments = async () => {
  try {
    const res = await api.get('/comments', { params: { taskId } })
    comments.value = res.data
  } catch (err) {
    console.error(err)
  }
}
const fetchNotes = async () => {
  try {
    const res = await api.get('/notes', { params: { taskId } })
    notes.value = res.data
  } catch (err) {
    console.error(err)
  }
}
const addComment = async () => {
  if (!newComment.value) return
  try {
    await api.post('/comments', { taskId, content: newComment.value, authorId: userId.value })
    newComment.value = ''
    showCommentForm.value = false
    fetchComments()
  } catch (err) {
    console.error(err)
  }
}
const addNote = async () => {
  if (!newNote.value) return
  try {
    await api.post('/notes', { taskId, content: newNote.value, teamVisible: noteTeamVisible.value })
    newNote.value = ''
    noteTeamVisible.value = false
    showNoteForm.value = false
    fetchNotes()
  } catch (err) {
    console.error(err)
  }
}
onMounted(() => {
  fetchTask()
  fetchComments()
  fetchNotes()
  // Pobierz userId z tokena JWT
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId.value = payload.sub || payload._id || ''
    }
  } catch {
    // intentionally left blank
  }
})

const canEditComment = (comment) => comment.authorId === userId.value
const canEditNote = (note) => note.authorId === userId.value

const deleteComment = async (id, skipConfirm = false) => {
  if (!skipConfirm && !confirm('Na pewno usunąć komentarz?')) return
  try {
    await api.delete(`/comments/${id}`)
    fetchComments()
  } catch {
    error.value = 'Błąd usuwania komentarza'
  }
}
const deleteNote = async (id, skipConfirm = false) => {
  if (!skipConfirm && !confirm('Na pewno usunąć notatkę?')) return
  try {
    await api.delete(`/notes/${id}`)
    fetchNotes()
  } catch {
    error.value = 'Błąd usuwania notatki'
  }
}
const editingCommentId = ref(null)
const editingCommentContent = ref('')

function editComment(comment) {
  editingCommentId.value = comment._id
  editingCommentContent.value = comment.content
}
function cancelEditComment() {
  editingCommentId.value = null
  editingCommentContent.value = ''
}
async function saveEditedComment(comment) {
  if (!editingCommentContent.value.trim()) return
  try {
    await api.patch(`/comments/${comment._id}`, { content: editingCommentContent.value })
    editingCommentId.value = null
    editingCommentContent.value = ''
    fetchComments()
  } catch {
    error.value = 'Błąd edycji komentarza'
  }
}

const editingNoteId = ref(null)
const editingNoteContent = ref('')
const editingNoteTeamVisible = ref(false)

function editNote(note) {
  editingNoteId.value = note._id
  editingNoteContent.value = note.content
  editingNoteTeamVisible.value = !!note.teamVisible
}
function cancelEditNote() {
  editingNoteId.value = null
  editingNoteContent.value = ''
  editingNoteTeamVisible.value = false
}
async function saveEditedNote(note) {
  if (!editingNoteContent.value.trim()) return
  try {
    await api.patch(`/notes/${note._id}`, { content: editingNoteContent.value, teamVisible: editingNoteTeamVisible.value })
    editingNoteId.value = null
    editingNoteContent.value = ''
    editingNoteTeamVisible.value = false
    fetchNotes()
  } catch {
    error.value = 'Błąd edycji notatki'
  }
}
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
.task-view-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.1);
  padding: 1.2rem 1rem;
  margin-bottom: 1.2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.status.todo {
  background: #e67e22;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.status.in-progress {
  background: #2980b9;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.status.done {
  background: #27ae60;
  color: white;
  border-radius: 8px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
}
.priority {
  margin-left: 0.7rem;
  font-size: 0.95rem;
  color: #888;
}
.add-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #1a232e;
}
.save-btn {
  background: #2980b9;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.save-btn:hover {
  background: #1a232e;
}
textarea {
  width: 100%;
  margin-bottom: 0.5rem;
}
.edit-btn,
.delete-btn {
  background: none;
  border: none;
  color: #2980b9;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 0.9rem;
}
.edit-btn:hover,
.delete-btn:hover {
  text-decoration: underline;
}
</style>
