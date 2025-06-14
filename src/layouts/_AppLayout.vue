<template>
  <component :is="layout">
    <RouterView />
  </component>
  <!-- <vc-toast></vc-toast>
  <vc-import ref="importDialog"></vc-import> -->
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const importDialog = ref<any>(null)
const layout = computed(() => {
  const layout = route?.meta?.layout || 'Default'

  if (layout) {
    return `The${layout}Layout`
  }
  return 'div'
})

onMounted(() => {
  window._import = importDialog.value
})
</script>
