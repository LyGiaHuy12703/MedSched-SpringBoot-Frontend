<template>
  <div class="role-detail">
    <va-card stripe stripe-color="primary">
      <va-card-title class="header flex items-center gap-1">
        <div class="header">
          <va-icon name="shield" color="primary" class="mr-2" />
          <h1 class="va-h6">Chi tiết vai trò</h1>
        </div>
        <div class="header chip-status">
          <VaChip v-if="roleDetail.active" color="success"><va-icon name="check" />Active</VaChip>
          <VaChip v-else color="danger"> <va-icon name="close" />InActive</VaChip>
        </div>
      </va-card-title>
      <va-card-content class="content">
        <div v-if="roleDetail" class="detail-grid mb-3">
          <div class="detail-item">
            <div class="label">
              <VaIcon name="fingerprint" size="small" class="mr-1" />
              ID
            </div>
            <VaChip color="primary" outline size="large" class="value">
              {{ roleDetail.id }}
            </VaChip>
          </div>
        </div>
        <div v-if="roleDetail" class="detail-grid mb-3">
          <div class="detail-item">
            <div class="label">
              <VaIcon name="tag" size="small" class="mr-1" />
              Tên vai trò
            </div>
            {{ roleDetail.name }}
          </div>
          <div class="detail-item">
            <div class="label">
              <VaIcon name="va-arrow-down" size="small" class="mr-1" />
              Mô tả
            </div>
            {{ roleDetail.description }}
          </div>
        </div>
        <div class="detail-item mb-3">
          <div class="label">
            <VaIcon name="lock" size="small" class="mr-2" />
            Quyền hạn
          </div>

          <!-- Danh sách quyền hạn -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <div
              v-for="(permission, index) in visiblePermissions"
              :key="index"
              class="bg-white rounded px-3 py-2 shadow-sm border text-sm"
            >
              {{ permission.name || permission }}
            </div>
          </div>
          <!-- <va-data-table
            :columns="columns"
            :items="roleDetail.permissions"
            item-size="1"
            class="mt-3"
          ></va-data-table> -->

          <!-- Nút xem thêm / ẩn bớt -->
          <div v-if="(roleDetail?.permissions?.length ?? 0) > 6" class="mt-3">
            <button class="text-blue-600 hover:underline text-sm" @click="toggleShow">
              {{ showAll ? 'Ẩn bớt' : 'Xem thêm' }}
            </button>
          </div>
        </div>

        <!-- Users -->
        <div class="detail-item">
          <div class="label">
            <VaIcon name="people" size="small" class="mr-2" />
            Danh sách người dùng
          </div>

          <!-- Danh sách user -->
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

          <!-- Nút xem thêm / ẩn bớt -->
          <div v-if="(roleDetail.users?.length ?? 0) > 6" class="mt-3">
            <button class="text-blue-600 hover:underline text-sm" @click="toggleUsers">
              {{ showAllUsers ? 'Ẩn bớt' : 'Xem thêm' }}
            </button>
          </div>
        </div>
      </va-card-content>
      <va-card-actions align="right" class="actions">
        <VaButton color="secondary" outline @click="$emit('close-modal')">
          <VaIcon name="close" class="mr-2" />
          Đóng
        </VaButton>
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
// const columns = [
//   {
//     text: 'Id',
//     key: 'id',
//     field: 'id',
//   },
//   {
//     text: 'Name',
//     key: 'name',
//     field: 'name',
//   },
//   {
//     text: 'Module',
//     key: 'module',
//     field: 'module',
//   },
//   {
//     text: 'ApiPath',
//     key: 'apiPath',
//     field: 'apiPath',
//   },
// ]
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

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }
  .chip-status {
    display: flex;
    justify-content: end;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-radius: 8px;
    background: var(--va-background-element);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--va-box-shadow);
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1rem;
      color: var(--va-text-primary);
    }
  }

  .no-data {
    text-align: center;
    padding: 2rem;
  }

  .actions {
    padding: 1rem 1.5rem;
  }
}
</style>
