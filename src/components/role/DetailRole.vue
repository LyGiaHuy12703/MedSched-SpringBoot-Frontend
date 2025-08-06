```vue
<template>
  <div class="role-detail">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header flex items-center gap-1">
        <div class="header-content">
          <va-icon name="shield" color="primary" class="mr-2" />
          <h1 class="va-h4">Chi tiết vai trò</h1>
        </div>
        <div class="chip-status">
          <va-chip v-if="roleDetail.active" color="success" size="small">
            <va-icon name="check" class="mr-1" />Active
          </va-chip>
          <va-chip v-else color="danger" size="small">
            <va-icon name="close" class="mr-1" />InActive
          </va-chip>
        </div>
      </va-card-title>
      <va-card-content class="content">
        <div v-if="roleDetail" class="add-grid mb-3">
          <div class="add-item">
            <div class="label"><va-icon name="fingerprint" size="small" class="mr-1" /> ID</div>
            <va-chip color="primary" outline size="large" class="value">
              {{ roleDetail.id }}
            </va-chip>
          </div>
        </div>
        <div v-if="roleDetail" class="add-grid mb-3">
          <div class="add-item">
            <div class="label"><va-icon name="tag" size="small" class="mr-1" /> Tên vai trò</div>
            <p class="value-text">{{ roleDetail.name }}</p>
          </div>
          <div class="add-item">
            <div class="label"><va-icon name="description" size="small" class="mr-1" /> Mô tả</div>
            <p class="value-text">{{ roleDetail.description }}</p>
          </div>
        </div>
        <div class="add-item permission-item mb-3">
          <div class="label"><va-icon name="lock" size="small" class="mr-1" /> Quyền hạn</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <div
              v-for="(permission, index) in visiblePermissions"
              :key="index"
              class="bg-white rounded px-3 py-2 shadow-sm border text-sm"
            >
              {{ permission.name || permission }}
            </div>
          </div>
          <div v-if="(roleDetail?.permissions?.length ?? 0) > 6" class="mt-3">
            <va-button
              preset="plain"
              class="text-blue-600 hover:underline text-sm"
              size="small"
              @click="toggleShow"
            >
              {{ showAll ? 'Ẩn bớt' : 'Xem thêm' }}
            </va-button>
          </div>
        </div>
        <div class="add-item permission-item">
          <div class="label">
            <va-icon name="people" size="small" class="mr-1" /> Danh sách người dùng
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <div
              v-for="(user, index) in visibleUsers"
              :key="index"
              class="bg-white rounded px-3 py-2 shadow-sm border text-sm"
            >
              <div class="font-medium">{{ user.name }}</div>
              <div class="text-gray-500 text-xs">{{ user.email }}</div>
            </div>
          </div>
          <div v-if="(roleDetail.users?.length ?? 0) > 6" class="mt-3">
            <va-button
              preset="plain"
              class="text-blue-600 hover:underline text-sm"
              size="small"
              @click="toggleUsers"
            >
              {{ showAllUsers ? 'Ẩn bớt' : 'Xem thêm' }}
            </va-button>
          </div>
        </div>
      </va-card-content>
      <va-card-actions class="actions">
        <va-button @click="$emit('close-modal')" color="secondary" class="action-button">
          Đóng
        </va-button>
      </va-card-actions>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Role } from '@/interfaces/role.interface'

const props = defineProps<{
  roleDetail: Role
}>()
const roleDetail = props.roleDetail

const showAll = ref(false)
const showAllUsers = ref(false)

const visiblePermissions = computed(() => {
  if (showAll.value) return roleDetail.permissions
  return (roleDetail?.permissions ?? []).slice(0, 6)
})

const toggleShow = () => {
  showAll.value = !showAll.value
}

const visibleUsers = computed(() => {
  if (showAllUsers.value) return roleDetail.users
  return (roleDetail.users ?? []).slice(0, 6)
})

const toggleUsers = () => {
  showAllUsers.value = !showAllUsers.value
}
</script>

<style scoped lang="scss">
.role-detail {
  padding: 1.5rem;

  .medicine-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    min-width: 600px;
    max-width: 900px;
    margin: 0 auto;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--va-background-border);
  }

  .chip-status {
    display: flex;
    justify-content: end;
    flex-grow: 1;
  }

  .content {
    padding: 1.5rem;
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .add-item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-radius: 6px;
    background: var(--va-background-secondary);
    border: 1px solid var(--va-background-border);
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--va-background-element);
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
    }

    .value-text {
      font-size: 0.9rem;
      color: var(--va-text-primary);
      margin: 0;
      padding: 0.25rem 0;
      word-break: break-word;
    }
  }

  .permission-item {
    grid-column: span 2;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--va-background-border);

    .action-button {
      font-weight: 500;
      border-radius: 4px;
      font-size: 0.9rem;
      margin-left: 0.5rem;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  @media (max-width: 768px) {
    .add-grid {
      grid-template-columns: 1fr;
    }

    .add-item {
      padding: 0.75rem;
    }

    .permission-item {
      grid-column: span 1;
    }

    .actions {
      flex-direction: column;

      .action-button {
        width: 100%;
        margin-bottom: 0.25rem;

        &:last-child {
          margin-bottom: 0;
        }

        &:first-child {
          margin-left: 0;
        }
      }
    }

    .medicine-card {
      min-width: 100%;
      max-width: 100%;
      margin: 0;
    }
  }
}
</style>
