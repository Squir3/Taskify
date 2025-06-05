<template>
  <div v-if="props.message" class="error-message">
    {{ props.message }}
  </div>
</template>

<script setup>
const props = defineProps({ message: String })
</script>

<style scoped>
.error-message {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
