<template>
  <VaSidebar
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :minimized="minimized"
    :width="sidebarWidth"
    color="background-secondary"
    minimized-width="64px"
  >
    <VaSidebarItem to="/" :active="isActive('/')">
      <VaSidebarItemContent>
        <VaIcon name="home" />
        <VaSidebarItemTitle v_if="!minimized">Trang chủ</VaSidebarItemTitle>
      </VaSidebarItemContent>
    </VaSidebarItem>

    <VaSidebarItem to="/find-doctor" :active="isActive('/find-doctor')">
      <VaSidebarItemContent>
        <VaIcon name="person_search" />
        <VaSidebarItemTitle v_if="!minimized">Tìm Bác Sĩ</VaSidebarItemTitle>
      </VaSidebarItemContent>
    </VaSidebarItem>

    <VaSidebarItem to="/my-records" :active="isActive('/my-records')">
      <VaSidebarItemContent>
        <VaIcon name="folder_shared" />
        <VaSidebarItemTitle v_if="!minimized">Hồ Sơ Bệnh Án</VaSidebarItemTitle>
      </VaSidebarItemContent>
    </VaSidebarItem>

    <VaSidebarItem to="/settings" :active="isActive('/settings')">
      <VaSidebarItemContent>
        <VaIcon name="settings" />
        <VaSidebarItemTitle v_if="!minimized">Cài đặt</VaSidebarItemTitle>
      </VaSidebarItemContent>
    </VaSidebarItem>
  </VaSidebar>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

defineProps<{
  modelValue: boolean; // For v-model binding with VaSidebar
  minimized: boolean;
  sidebarWidth: string;
}>();

defineEmits(['update:modelValue']);

const route = useRoute();
const isActive = (path: string) => route.path === path;
</script>

<style scoped>
.va-sidebar {
  height: calc(100vh - 60px); /* Adjust based on header height */
  position: sticky;
  top: 60px; /* Adjust based on header height */
}
/* Nếu muốn sidebar luôn có chiều cao full khi nội dung ngắn */
:deep(.va-sidebar__menu) {
    height: 100%;
}
</style>
