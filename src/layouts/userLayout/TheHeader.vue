// src/components/AppHeaderClean.vue
<template>
  <VaNavbar color="background-primary" class="app-header-clean" shadow>
    <template #left>
      <RouterLink to="/" class="logo-link">
        <VaIcon name="health_and_safety" color="primary" size="28px" />
        <span class="logo-text va-h4 text--primary ml-2">MedSched</span>
      </RouterLink>
    </template>

    <template #right>
      <div class="nav-links" v-if="!isMobile">
        <VaButton preset="secondary" class="nav-link" to="/find-doctor">Tìm Bác Sĩ</VaButton>
        <VaButton preset="secondary" class="nav-link" to="/bookings">Đặt lịch khám</VaButton>
        <VaButton preset="secondary" class="nav-link" to="/medicines">Tra cứu thuốc</VaButton>
        <VaButton preset="secondary" class="nav-link" to="/manage-bookings"
          >Quản lý lịch hẹn</VaButton
        >
      </div>

      <VaDropdown v-model="isMobileMenuOpen" :offset="[0, 10]" v-if="isMobile">
        <template #anchor>
          <VaButton
            preset="primary"
            :icon="isMobileMenuOpen ? 'close' : 'menu'"
            aria-label="Toggle menu"
          />
        </template>
        <VaDropdownContent class="mobile-menu-content">
          <VaList>
            <VaListItem to="/find-doctor" @click="isMobileMenuOpen = false">
              <VaListItemSection>
                <VaListItemLabel>Tìm Bác Sĩ</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem to="/services" @click="isMobileMenuOpen = false">
              <VaListItemSection>
                <VaListItemLabel>Dịch vụ</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem to="/blog" @click="isMobileMenuOpen = false">
              <VaListItemSection>
                <VaListItemLabel>Tin tức</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem to="/contact" @click="isMobileMenuOpen = false">
              <VaListItemSection>
                <VaListItemLabel>Liên hệ</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem to="/login" @click="isMobileMenuOpen = false" v-if="!isAuthenticated">
              <VaListItemSection icon>
                <VaIcon name="login" color="primary" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Đăng nhập </VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem to="/profile" @click="isMobileMenuOpen = false" v-if="isAuthenticated">
              <VaListItemSection icon>
                <VaIcon name="person" color="primary" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Hồ sơ</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </VaDropdownContent>
      </VaDropdown>

      <VaButton
        v-if="!isMobile && !isAuthenticated"
        color="primary"
        class="ml-3"
        @click="handleLogout"
      >
        Đăng nhập
      </VaButton>
      <VaDropdown trigger="hover">
        <template #anchor>
          <VaAvatar
            v-if="isAuthenticated"
            :src="userApi.user.avatarUrl || '/defaultAvatar.png'"
            size="small"
            class="ml-3 cursor-pointer"
            aria-label="User profile"
          />
        </template>
        <VaDropdownContent>
          <VaList>
            <VaListItem to="/profiles" @click="isMobileMenuOpen = false">
              <VaListItemSection icon>
                <VaIcon name="person" color="primary" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Hồ sơ</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
            <VaListItem @click="handleLogout">
              <VaListItemSection icon>
                <VaIcon name="logout" color="primary" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Đăng xuất</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </VaDropdownContent>
      </VaDropdown>
    </template>
  </VaNavbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBreakpoint } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { Account } from '@/interfaces/auth.interfaces'
const userApi = ref<Account>({
  user: {
    id: '',
    name: '',
    email: '',
    role: '',
    avatarUrl: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    age: 0,
  },
})
const breakpoint = useBreakpoint()
const router = useRouter()
const authStore = useAuthStore()

const isMobile = computed(() => breakpoint.smDown)
const isMobileMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(async () => {
  const data = await authStore.getInfo()
  if (data) {
    userApi.value = data // Cập nhật userApi.value
  } else {
    console.error('Failed to fetch user info')
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header-clean {
  padding: 0 1rem; /* Hoặc var(--va-container-padding-x) */
  height: 70px; /* Tăng chiều cao header */
  border-bottom: 1px solid var(--va-background-border);
  background-color: var(--va-background-primary) !important; /* Đảm bảo màu nền */
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-text {
  font-weight: 600; /* Hoặc 700 */
  color: var(--va-primary);
  line-height: 1;
}

.nav-links .nav-link {
  margin: 0 0.75rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.nav-links .nav-link:hover {
  color: var(--va-primary);
}

.mobile-menu-content {
  min-width: 200px; /* Đảm bảo dropdown đủ rộng */
}

.cursor-pointer {
  cursor: pointer;
}

/* Sử dụng Vuestic variables nếu có thể, ví dụ cho shadow, padding */
.app-header-clean.va-navbar {
  box-shadow: var(--va-shadow); /* Sử dụng shadow của Vuestic */
}
</style>
