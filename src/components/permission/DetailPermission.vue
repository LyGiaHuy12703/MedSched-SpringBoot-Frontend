<template>
  <div class="permission-detail">
    <VaCard stripe stripe-color="primary">
      <VaCardTitle class="header">
        <VaIcon name="key" color="primary" class="mr-2" />
        <h1 class="va-h4">Chi tiết quyền hạn</h1>
      </VaCardTitle>
      <VaCardContent class="content">
        <div v-if="permissionDetail" class="detail-grid">
          <!-- Tên quyền hạn -->
          <div class="detail-item">
            <div class="label">
              <VaIcon name="tag" size="small" class="mr-1" />
              Tên quyền hạn
            </div>
            <p class="value">{{ permissionDetail.name || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Đường dẫn API -->
          <div class="detail-item">
            <div class="label">
              <VaIcon name="link" size="small" class="mr-1" />
              Đường dẫn API
            </div>
            <p class="value">{{ permissionDetail.apiPath || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Module -->
          <div class="detail-item">
            <div class="label">
              <VaIcon name="folder" size="small" class="mr-1" />
              Module
            </div>
            <p class="value">{{ permissionDetail.module || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Phương thức -->
          <div class="detail-item">
            <div class="label">
              <VaIcon name="code" size="small" class="mr-1" />
              Phương thức
            </div>
            <VaChip
              :color="getMethodColor(permissionDetail.method || '')"
              size="medium"
              class="value"
            >
              {{ permissionDetail.method || 'Không có dữ liệu' }}
            </VaChip>
          </div>
        </div>
        <div v-else class="no-data">
          <VaAlert color="warning" outline class="text-center">
            <VaIcon name="warning" class="mr-2" />
            Không có dữ liệu để hiển thị.
          </VaAlert>
        </div>
      </VaCardContent>
      <VaCardActions align="right" class="actions">
        <VaButton color="secondary" outline @click="$emit('close-modal')">
          <VaIcon name="close" class="mr-2" />
          Đóng
        </VaButton>
      </VaCardActions>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import type { Permission } from '../../../../interfaces/permission.interface'
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

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }

  .content {
    padding: 1.5rem;
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
