<template>
  <va-layout class="h-screen bg-[var(--va-background-secondary)]">
    <!-- Layout cho màn hình lớn (lgUp) -->
    <div v-if="isLgUp" class="flex h-full">
      <!-- Left section (Logo) -->
      <div class="flex items-center justify-center bg-primary text-white w-[50vw]">
        <RouterLink to="/" aria-label="Visit homepage">
          <div class="d-flex items-layout">
            <h2 class="item">MEDSCHED</h2>
          </div>
          <div class="d-flex items-layout">
            <h2>Sắp xếp thời gian - cải thiện sức khỏe</h2>
          </div>
        </RouterLink>
      </div>

      <!-- Right section (RouterView) -->
      <div class="flex items-center justify-center w-full">
        <RouterView />
      </div>
    </div>

    <!-- Layout cho màn hình nhỏ -->
    <div v-else class="p-4 flex flex-col items-center justify-start h-full">
      <RouterLink to="/" aria-label="Visit homepage" class="py-4 text-xl text-center text-primary">
        <h2 class="font-bold">MEDSCHED</h2>
      </RouterLink>
      <va-card class="w-full max-w-[420px] shadow-md">
        <va-card-content>
          <RouterView />
        </va-card-content>
      </va-card>
    </div>
  </va-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isLgUp = ref(false)

const updateBreakpoint = () => {
  isLgUp.value = window.innerWidth >= 1024
}

onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateBreakpoint)
})

const breakpoint = computed(() => isLgUp.value)
</script>

<style scoped>
.bg-primary {
  background-color: #1e40af;
}
.items-layout {
  justify-content: center;
  .item {
    font-size: 40px;
  }
}
</style>
