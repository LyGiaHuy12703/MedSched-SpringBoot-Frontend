<script setup lang="ts">
import TheNavStaff from '@/layouts/staffLayout/TheNavStaff.vue'
import TheSideStaff from '@/layouts/staffLayout/TheSideStaff.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const isSidebarMinimized = ref(false)
const isMobile = ref(false)
const isSidebarVisible = ref(true)

const toggleSidebar = () => {
  if (isMobile.value) {
    isSidebarVisible.value = !isSidebarVisible.value
  } else {
    isSidebarMinimized.value = !isSidebarMinimized.value
  }
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  isSidebarVisible.value = !isMobile.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Breadcrumbs động
const route = useRoute()
const breadcrumbs = computed(() => {
  // Nếu là trang home
  if (route.path === '/' || route.path === '/staff' || route.path === '/staff/') {
    return [{ label: 'Staff', to: '/staff' }, { label: 'Dashboard' }]
  }
  // Nếu có meta.breadcrumbs thì dùng
  if (route.meta && route.meta.breadcrumbs) {
    return [
      { label: 'Staff', to: '/staff' },
      ...(route.meta.breadcrumbs as Array<{ label: string; to?: string }>),
    ]
  }
  // Tạo breadcrumbs động từ path
  const paths = route.path.replace(/^\/|\/$/g, '').split('/')
  let acc = '/staff'
  const crumbs = [{ label: 'Staff', to: '/staff' }]
  paths.forEach((p) => {
    if (p && p !== 'staff') {
      acc += '/' + p
      crumbs.push({ label: p.charAt(0).toUpperCase() + p.slice(1), to: acc })
    }
  })
  return crumbs
})
</script>

<template>
  <div class="staff-layout">
    <TheSideStaff
      :is-minimized="isSidebarMinimized"
      :is-visible="isSidebarVisible"
      @close="isSidebarVisible = false"
    />

    <div
      class="staff-content"
      :class="{ 'sidebar-minimized': isSidebarMinimized, 'sidebar-hidden': !isSidebarVisible }"
    >
      <TheNavStaff @toggle-sidebar="toggleSidebar" />

      <main class="content-wrapper">
        <va-breadcrumbs class="breadcrumbs mx-4" separator="/">
          <va-breadcrumbs-item
            v-for="(bc, idx) in breadcrumbs"
            :key="idx"
            :label="bc.label"
            :to="bc.to"
            :disabled="!bc.to || idx === breadcrumbs.length - 1"
          />
        </va-breadcrumbs>

        <div class="content-container pa-4">
          <slot />
        </div>
      </main>

      <!-- <AppFooter /> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
}
.fixed-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
  width: inherit;
  background: var(--va-background-element);
}
.staff-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  width: calc(100% - 250px);

  &.sidebar-minimized {
    margin-left: 64px;
    width: calc(100% - 64px);
  }

  &.sidebar-hidden {
    margin-left: 0;
    width: 100%;
  }
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: var(--va-background-element);
}

.content-container {
  height: 100%;
}

@media (max-width: 767px) {
  .staff-content {
    width: 100%;
    margin-left: 0;
  }
}
</style>
