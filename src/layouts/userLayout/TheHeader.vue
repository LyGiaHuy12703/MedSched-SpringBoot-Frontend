<template>
  <header class="app-header-clean">
    <nav class="header-nav">
      <!-- Logo Section -->
      <div class="logo-section">
        <RouterLink to="/" class="logo-link">
          <div class="logo-container">
            <VaIcon name="health_and_safety" class="logo-icon" />
            <span class="logo-text">MedSched</span>
          </div>
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-section" v-if="!isMobile">
        <div class="nav-links">
          <RouterLink to="/find-doctor" class="nav-link">
            <VaIcon name="search" class="nav-icon" />
            <span>Tìm Bác Sĩ</span>
          </RouterLink>

          <RouterLink to="/bookings" class="nav-link">
            <VaIcon name="calendar_today" class="nav-icon" />
            <span>Đặt lịch khám</span>
          </RouterLink>

          <RouterLink to="/medicines" class="nav-link">
            <VaIcon name="medication" class="nav-icon" />
            <span>Tra cứu thuốc</span>
          </RouterLink>

          <RouterLink to="/patient-feedback" class="nav-link">
            <VaIcon name="star" class="nav-icon" />
            <span>Đánh giá</span>
          </RouterLink>

          <RouterLink to="/manage-bookings" class="nav-link" v-if="isAuthenticated">
            <VaIcon name="event_note" class="nav-icon" />
            <span>Quản lý lịch hẹn</span>
          </RouterLink>
        </div>
      </div>

      <!-- User Section -->
      <div class="user-section">
        <!-- Login Button for Non-authenticated Users -->
        <VaButton
          v-if="!isMobile && !isAuthenticated"
          preset="primary"
          class="login-btn"
          @click="handleLogin"
        >
          <VaIcon name="login" class="mr-2" />
          Đăng nhập
        </VaButton>

        <!-- User Profile Dropdown - Fixed hover issue -->
        <div
          v-if="!isMobile && isAuthenticated"
          class="user-dropdown-container"
          @mouseenter="showUserMenu = true"
          @mouseleave="showUserMenu = false"
        >
          <div class="user-profile">
            <VaAvatar
              :src="userApi.user.avatarUrl || '/defaultAvatar.png'"
              size="42px"
              class="user-avatar"
            />
            <div class="user-info">
              <span class="user-name">{{ userApi.user.name || 'User' }}</span>
              <span class="user-role">{{ userApi.user.role[0]?.name || 'Bệnh nhân' }}</span>
            </div>
            <VaIcon
              name="keyboard_arrow_down"
              class="dropdown-arrow"
              :class="{ rotated: showUserMenu }"
            />
          </div>

          <Transition name="dropdown">
            <div v-if="showUserMenu" class="user-menu">
              <div class="user-menu-header">
                <VaAvatar :src="userApi.user.avatarUrl || '/defaultAvatar.png'" size="50px" />
                <div class="user-details">
                  <div class="user-name">{{ userApi.user.name }}</div>
                  <div class="user-email">{{ userApi.user.email }}</div>
                </div>
              </div>

              <div class="menu-divider"></div>

              <div class="user-menu-list">
                <RouterLink to="/profiles" class="menu-item" @click="showUserMenu = false">
                  <VaIcon name="person" color="primary" />
                  <span>Hồ sơ cá nhân</span>
                </RouterLink>

                <RouterLink to="#" class="menu-item" @click="showUserMenu = false">
                  <VaIcon name="settings" color="primary" />
                  <span>Cài đặt</span>
                </RouterLink>

                <RouterLink to="#" class="menu-item" @click="showUserMenu = false">
                  <VaIcon name="help" color="primary" />
                  <span>Trợ giúp</span>
                </RouterLink>

                <div class="menu-divider"></div>

                <button @click="handleLogout" class="menu-item logout-item">
                  <VaIcon name="logout" color="danger" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Mobile Menu Button -->
        <VaButton
          v-if="isMobile"
          preset="secondary"
          :icon="isMobileMenuOpen ? 'close' : 'menu'"
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
        />
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <Transition name="mobile-menu">
      <div v-if="isMobile && isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu">
        <div class="mobile-menu" @click.stop>
          <div class="mobile-menu-header">
            <div class="mobile-logo">
              <VaIcon name="health_and_safety" class="mobile-logo-icon" />
              <span class="mobile-logo-text">MedSched</span>
            </div>
            <VaButton preset="secondary" icon="close" size="small" @click="closeMobileMenu" />
          </div>

          <div class="mobile-menu-content">
            <!-- User Info Section (Mobile) -->
            <div v-if="isAuthenticated" class="mobile-user-section">
              <VaAvatar
                :src="userApi.user.avatarUrl || '/defaultAvatar.png'"
                size="60px"
                class="mobile-user-avatar"
              />
              <div class="mobile-user-info">
                <div class="mobile-user-name">{{ userApi.user.name }}</div>
                <div class="mobile-user-email">{{ userApi.user.email }}</div>
              </div>
            </div>

            <div v-if="isAuthenticated" class="mobile-divider"></div>

            <!-- Navigation Links -->
            <div class="mobile-nav-list">
              <RouterLink to="/find-doctor" @click="closeMobileMenu" class="mobile-nav-item">
                <VaIcon name="search" color="primary" />
                <span>Tìm Bác Sĩ</span>
              </RouterLink>

              <RouterLink to="/bookings" @click="closeMobileMenu" class="mobile-nav-item">
                <VaIcon name="calendar_today" color="primary" />
                <span>Đặt lịch khám</span>
              </RouterLink>

              <RouterLink to="/medicines" @click="closeMobileMenu" class="mobile-nav-item">
                <VaIcon name="medication" color="primary" />
                <span>Tra cứu thuốc</span>
              </RouterLink>

              <RouterLink to="/patient-feedback" @click="closeMobileMenu" class="mobile-nav-item">
                <VaIcon name="star" color="primary" />
                <span>Đánh giá</span>
              </RouterLink>

              <RouterLink to="/manage-bookings" @click="closeMobileMenu" class="mobile-nav-item">
                <VaIcon name="event_note" color="primary" />
                <span>Quản lý lịch hẹn</span>
              </RouterLink>

              <div class="mobile-divider"></div>

              <!-- Auth Actions -->
              <button
                v-if="!isAuthenticated"
                @click="handleLogin"
                class="mobile-nav-item auth-item"
              >
                <VaIcon name="login" color="primary" />
                <span>Đăng nhập</span>
              </button>

              <template v-if="isAuthenticated">
                <RouterLink to="/profiles" @click="closeMobileMenu" class="mobile-nav-item">
                  <VaIcon name="person" color="primary" />
                  <span>Hồ sơ cá nhân</span>
                </RouterLink>

                <button @click="handleLogout" class="mobile-nav-item logout-item">
                  <VaIcon name="logout" color="danger" />
                  <span>Đăng xuất</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
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
    userType: '',
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
const showUserMenu = ref(false)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogin = () => {
  router.push('/login')
  closeMobileMenu()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  closeMobileMenu()
  showUserMenu.value = false
}

onMounted(async () => {
  const data = await authStore.getInfo()
  if (data) {
    userApi.value = data
  } 
})
</script>

<style scoped lang="scss">
.app-header-clean {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #ecf0f1;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--va-background-border);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

  .header-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    height: 80px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .logo-section {
    .logo-link {
      text-decoration: none;

      .logo-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(var(--va-primary-rgb), 0.1);
          transform: translateY(-1px);
        }

        .logo-icon {
          font-size: 2rem;
          color: var(--va-primary);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--va-primary);
          letter-spacing: -0.5px;
        }
      }
    }
  }

  .nav-section {
    flex: 1;
    display: flex;
    justify-content: center;

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        text-decoration: none;
        color: var(--va-text-primary);
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        position: relative;

        .nav-icon {
          font-size: 1.1rem;
          opacity: 0.8;
        }

        &:hover {
          background: rgba(var(--va-primary-rgb), 0.1);
          color: var(--va-primary);
          transform: translateY(-1px);

          .nav-icon {
            opacity: 1;
          }
        }

        &.router-link-active {
          background: var(--va-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.3);

          .nav-icon {
            opacity: 1;
          }
        }
      }
    }
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;

    .login-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(var(--va-primary-rgb), 0.4);
      }
    }

    .user-dropdown-container {
      position: relative;

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(var(--va-primary-rgb), 0.05);
        border: 1px solid rgba(var(--va-primary-rgb), 0.1);

        &:hover {
          background: rgba(var(--va-primary-rgb), 0.1);
          border-color: rgba(var(--va-primary-rgb), 0.2);
          transform: translateY(-1px);
        }

        .user-avatar {
          border: 2px solid var(--va-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .user-name {
            font-weight: 600;
            color: black;
            font-size: 0.9rem;
            line-height: 1.2;
          }

          .user-role {
            font-size: 0.75rem;
            color: var(--va-text-secondary);
            line-height: 1.2;
          }
        }

        .dropdown-arrow {
          color: black;
          transition: transform 0.3s ease;
          font-size: 1.2rem;

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }

      .user-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 280px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border: 1px solid var(--va-background-border);
        overflow: hidden;
        z-index: 1001;

        .user-menu-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--va-primary), rgba(var(--va-primary-rgb), 0.8));

          .user-details {
            .user-name {
              font-weight: 600;
              font-size: 1rem;
              margin-bottom: 0.25rem;
            }

            .user-email {
              font-size: 0.875rem;
              opacity: 0.9;
            }
          }
        }

        .menu-divider {
          height: 1px;
          background: var(--va-background-border);
          margin: 0;
        }

        .user-menu-list {
          padding: 0.5rem 0;

          .menu-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            color: var(--va-text-primary);
            transition: all 0.3s ease;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            cursor: pointer;

            &:hover {
              background: rgba(var(--va-primary-rgb), 0.1);
            }

            &.logout-item:hover {
              background: rgba(var(--va-danger-rgb), 0.1);
            }
          }
        }
      }
    }

    .mobile-menu-btn {
      padding: 0.75rem;
      border-radius: 12px;
    }
  }
}

// Mobile Menu Styles
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;

  .mobile-menu {
    width: 320px;
    height: 100vh;
    background: var(--va-background-element);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;

    .mobile-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      background: var(--va-primary);
      color: white;

      .mobile-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .mobile-logo-icon {
          font-size: 1.5rem;
        }

        .mobile-logo-text {
          font-size: 1.25rem;
          font-weight: 700;
        }
      }
    }

    .mobile-menu-content {
      flex: 1;
      overflow-y: auto;

      .mobile-user-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;

        .mobile-user-avatar {
          border: 2px solid var(--va-primary);
        }

        .mobile-user-info {
          .mobile-user-name {
            font-weight: 600;
            color: var(--va-text-primary);
            margin-bottom: 0.25rem;
          }

          .mobile-user-email {
            font-size: 0.875rem;
            color: var(--va-text-secondary);
          }
        }
      }

      .mobile-divider {
        height: 1px;
        background: var(--va-background-border);
        margin: 0;
      }

      .mobile-nav-list {
        padding: 1rem 0;

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          text-decoration: none;
          color: var(--va-text-primary);
          transition: all 0.3s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;

          &:hover {
            background: rgba(var(--va-primary-rgb), 0.1);
          }

          &.auth-item {
            background: rgba(var(--va-primary-rgb), 0.1);
            margin: 0.5rem 1rem;
            border-radius: 12px;
          }

          &.logout-item:hover {
            background: rgba(var(--va-danger-rgb), 0.1);
          }
        }
      }
    }
  }
}

// Dropdown Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Mobile Menu Transitions
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-menu,
.mobile-menu-leave-to .mobile-menu {
  transform: translateX(100%);
}

// Responsive Design
@media (max-width: 1200px) {
  .app-header-clean {
    .header-nav {
      padding: 0 1.5rem;
    }

    .nav-links {
      gap: 0.25rem;

      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .app-header-clean {
    .header-nav {
      padding: 0 1rem;
      height: 70px;
    }

    .logo-container {
      .logo-text {
        font-size: 1.25rem;
      }

      .logo-icon {
        font-size: 1.5rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .mobile-menu {
    width: 100vw !important;
  }

  .app-header-clean {
    .header-nav {
      padding: 0 0.75rem;
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .app-header-clean {
    background: rgba(30, 30, 30, 0.98);
  }

  .user-menu {
    background: var(--va-background-element) !important;
  }
}
</style>
