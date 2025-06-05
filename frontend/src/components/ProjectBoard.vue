<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Twoje Projekty</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        class="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
        v-for="project in projects"
        :key="project.id"
      >
        <h3 class="text-lg font-semibold">{{ project.name }}</h3>
      </div>
    </div>
    <div class="mt-4">
      <input v-model="newProject" placeholder="Nazwa projektu" class="border p-2 rounded w-full" />
      <button
        @click="addProject"
        class="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Dodaj
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newProject = ref('')
const projects = ref([
  { id: 1, name: 'Projekt Alpha' },
  { id: 2, name: 'Projekt Beta' },
])

const addProject = () => {
  if (newProject.value.trim()) {
    projects.value.push({
      id: Date.now(),
      name: newProject.value,
    })
    newProject.value = ''
  }
}
</script>
