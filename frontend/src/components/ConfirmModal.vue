<template>
  <div class="modal-bg">
    <div class="modal-card">
      <div class="modal-title">{{ title }}</div>
      <div class="modal-content">{{ message }}</div>
      <div class="modal-actions">
        <button class="confirm-btn" @click="$emit('confirm')">Potwierdź</button>
        <button class="cancel-btn" @click="$emit('cancel')">Anuluj</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String,
})
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.18);
  padding: 2rem 1.5rem;
  min-width: 320px;
  max-width: 400px;
  text-align: center;
}
.modal-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.confirm-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
.cancel-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
