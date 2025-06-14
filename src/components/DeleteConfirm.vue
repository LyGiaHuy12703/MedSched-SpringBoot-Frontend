<template>
  <VaCardContent>
    <h2 class="va-h5 font-semibold mb-5" style="color: #ef4444 !important">
      {{ title }}
    </h2>
    <p class="text-gray-600 mb-4 mt-5">{{ message }}</p>
    <div class="d-flex actions-container">
      <VaButton color="secondary" class="mr-3" @click="$emit('close-confirm')">Hủy</VaButton>
      <VaButton color="primary" @click="$emit('confirm')">Xác nhận</VaButton>
    </div>
  </VaCardContent>
</template>
<script setup lang="ts">

defineProps<{
  title: string
  message: string
}>()
</script>
<style scoped lang="scss">
.actions-container {
  justify-content: flex-end;
}
</style>
