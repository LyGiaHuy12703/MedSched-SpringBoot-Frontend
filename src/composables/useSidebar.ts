import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useSidebar() {
  const isSidebarVisible = ref(false)
  const isCollapsed = ref(false)
  const screenWidth = ref(window.innerWidth)

  const isMobile = computed(() => screenWidth.value <= 768)
  const isTablet = computed(() => screenWidth.value <= 1024 && screenWidth.value > 768)

  const toggleSidebar = () => {
    if (isMobile.value) {
      isSidebarVisible.value = !isSidebarVisible.value
    } else if (isTablet.value) {
      isCollapsed.value = !isCollapsed.value
    }
  }

  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth
    if (isMobile.value) {
      isSidebarVisible.value = false
    } else {
      isSidebarVisible.value = true
    }
    if (isTablet.value) {
      isCollapsed.value = true
    } else {
      isCollapsed.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', updateScreenWidth)
    updateScreenWidth()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenWidth)
  })

  return {
    isSidebarVisible,
    isCollapsed,
    isMobile,
    toggleSidebar,
  }
}
