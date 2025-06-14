import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isModalOpen: false,
    message: '',
  }),
  actions: {
    showModal(message: string) {
      this.isModalOpen = true
      this.message = message
    },
    closeModal() {
      this.isModalOpen = false
      this.message = ''
    },
  },
})
