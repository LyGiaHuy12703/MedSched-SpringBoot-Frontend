```vue
<template>
  <div class="admin-layout">
    <TheSideBar
      :is-minimized="isSidebarMinimized"
      :is-visible="isSidebarVisible"
      @close="isSidebarVisible = false"
      :class="{ visible: isSidebarVisible && isMobile }"
      class="fixed-sidebar"
    />

    <div
      class="admin-content"
      :class="{
        'sidebar-minimized': isSidebarMinimized,
        'sidebar-hidden': !isSidebarVisible || isMobile,
      }"
    >
      <TheNavBar @toggle-sidebar="toggleSidebar" class="fixed-header" />

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
    </div>
  </div>
</template>

<script setup lang="ts">
import TheNavBar from '@/layouts/adminLayout/TheNavBar.vue'
import TheSideBar from '@/layouts/adminLayout/TheSideBar.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const isSidebarMinimized = ref(false)
const isMobile = ref(false)
const isSidebarVisible = ref(false) // Mặc định ẩn trên mobile

const toggleSidebar = () => {
  if (isMobile.value) {
    isSidebarVisible.value = !isSidebarVisible.value
  } else {
    isSidebarMinimized.value = !isSidebarMinimized.value
  }
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  isSidebarVisible.value = !isMobile.value // Mặc định mở trên desktop, đóng trên mobile
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
  if (route.path === '/' || route.path === '/admin' || route.path === '/admin/') {
    return [{ label: 'Admin', to: '/admin' }, { label: 'Dashboard' }]
  }
  if (route.meta && route.meta.breadcrumbs) {
    return [
      { label: 'Admin', to: '/admin' },
      ...(route.meta.breadcrumbs as Array<{ label: string; to?: string }>),
    ]
  }
  const paths = route.path.replace(/^\/|\/$/g, '').split('/')
  let acc = '/admin'
  const crumbs = [{ label: 'Admin', to: '/admin' }]
  paths.forEach((p) => {
    if (p && p !== 'admin') {
      acc += '/' + p
      crumbs.push({ label: p.charAt(0).toUpperCase() + p.slice(1), to: acc })
    }
  })
  return crumbs
})
</script>

<style lang="scss" scoped>
.admin-layout {
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
  transition: transform 0.3s ease;

  &.visible {
    transform: translateX(0);
  }

  @media (max-width: 767px) {
    transform: translateX(-100%);
  }
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
  width: inherit;
  background: var(--va-background-element);
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  width: calc(100% - 250px);
  margin-left: 250px;

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
  margin-top: 64px;
  overflow-x: hidden;
}

.breadcrumbs {
  position: sticky;
  top: 0;
  background: var(--va-background-element);
  padding: 1rem 0;
  z-index: 0;
}

.content-container {
  min-height: calc(100vh - 64px - 48px);
}

@media (max-width: 767px) {
  .admin-content {
    width: 100%;
    margin-left: 0;
  }

  .fixed-sidebar {
    z-index: 1000; // Đảm bảo sidebar hiển thị trên content
  }
}
</style>
