<script setup lang="ts">
import TheFooter from '@/layouts/userLayout/TheFooter.vue'
import TheHeader from '@/layouts/userLayout/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <slot></slot>
  <TheFooter />
</template>
