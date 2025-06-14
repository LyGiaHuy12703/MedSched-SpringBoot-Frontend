<template>
  <div v-if="modalStore.isModalOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ modalStore.message }}</h2>
      <div class="modal-actions">
        <button @click="goToLogin" v-if="!userStore.isAuthenticated">Đăng nhập</button>
        <button @click="closeModal">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modal.store'
import { useUserStore } from '@/stores/users.store'

const router = useRouter()
const modalStore = useModalStore()
const userStore = useUserStore()

const goToLogin = () => {
  modalStore.closeModal() // Đóng modal
  router.push({ name: 'Login' }) // Chuyển hướng đến trang Login
}

const closeModal = () => {
  modalStore.closeModal() // Đóng modal
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:first-child {
  background: #007bff;
  color: white;
}

button:last-child {
  background: #6c757d;
  color: white;
}
</style>
