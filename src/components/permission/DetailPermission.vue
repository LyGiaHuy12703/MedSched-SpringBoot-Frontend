<template>
  <div class="permission-detail">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header">
        <va-icon name="key" color="primary" class="mr-2" />
        <h1 class="va-h4">Chi tiết quyền hạn</h1>
      </va-card-title>
      <va-card-content class="content">
        <div v-if="permissionDetail" class="add-grid">
          <div class="add-item">
            <div class="label"><va-icon name="tag" size="small" class="mr-1" /> Tên quyền hạn</div>
            <p class="value-text">{{ permissionDetail.name || 'Không có dữ liệu' }}</p>
          </div>
          <div class="add-item">
            <div class="label"><va-icon name="link" size="small" class="mr-1" /> Đường dẫn API</div>
            <p class="value-text">{{ permissionDetail.apiPath || 'Không có dữ liệu' }}</p>
          </div>
          <div class="add-item">
            <div class="label"><va-icon name="folder" size="small" class="mr-1" /> Module</div>
            <p class="value-text">{{ permissionDetail.module || 'Không có dữ liệu' }}</p>
          </div>
          <div class="add-item">
            <div class="label"><va-icon name="code" size="small" class="mr-1" /> Phương thức</div>
            <va-chip
              :color="getMethodColor(permissionDetail.method || '')"
              size="medium"
              class="value-text"
            >
              {{ permissionDetail.method || 'Không có dữ liệu' }}
            </va-chip>
          </div>
        </div>
        <div v-else class="no-data">
          <va-alert color="warning" outline class="text-center">
            <va-icon name="warning" class="mr-2" />
            Không có dữ liệu để hiển thị.
          </va-alert>
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
import type { Permission } from '@/interfaces/permission.interface'

defineProps<{
  permissionDetail: Permission
}>()

const getMethodColor = (method: string) => {
  switch (method?.toUpperCase()) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'warning'
    case 'PUT':
      return 'info'
    case 'DELETE':
      return 'danger'
    default:
      return 'primary'
  }
}
</script>

<style scoped lang="scss">
.permission-detail {
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

  .no-data {
    text-align: center;
    padding: 2rem;
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
