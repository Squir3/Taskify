<template>
  <div class="loader-overlay">
    <div class="loader"></div>
  </div>
</template>

<script>
export default {
  name: 'AppLoader'
}
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #2980b9;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
