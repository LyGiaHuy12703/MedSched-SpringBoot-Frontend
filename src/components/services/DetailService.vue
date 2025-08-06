```vue
<template>
  <div class="add-service">
    <va-card class="department-card">
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="medical_services" color="primary" class="mr-1"></va-icon>
          <h1 class="va-h4 title-text">Dữ liệu dịch vụ</h1>
        </va-card-title>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="label" size="small" class="mr-1"></va-icon>
              <span class="label-text">Tên dịch vụ</span>
            </div>
            <p class="value-text">{{ serviceData.name }}</p>
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="attach_money" size="small" class="mr-1"></va-icon>
              <span class="label-text">Giá</span>
            </div>
            <p class="value-text">{{ serviceData.price }} VNĐ</p>
          </div>
        </div>
        <div class="add-grid mt-2">
          <div class="add-item full-width">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1"></va-icon>
              <span class="label-text">Mô tả</span>
            </div>
            <p class="value-text">{{ serviceData.description }}</p>
          </div>
        </div>
        <VaCardActions class="actions">
          <VaButton
            @click="$emit('close-modal')"
            preset="primary"
            color="secondary"
            class="action-button"
            >Hủy</VaButton
          >
        </VaCardActions>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '@/interfaces/service.interfaces'

const props = defineProps<{
  serviceData: Service
}>()
const serviceData = props.serviceData
</script>

<style scoped lang="scss">
.add-service {
  padding: 1rem;

  .department-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;

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

    .title-text {
      font-weight: 600;
      color: var(--va-primary);
      margin: 0;
      font-size: 1.1rem;
    }
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    padding: 0.75rem;

    &.mt-2 {
      margin-top: 1rem;
    }
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

    &.full-width {
      grid-column: 1 / -1;
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .value-text {
      font-size: 0.9rem;
      color: var(--va-text-primary);
      margin: 0;
      padding: 0.25rem 0;
      word-break: break-word;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 0.75rem;
    border-top: 1px solid var(--va-background-border);

    .action-button {
      font-weight: 500;
      border-radius: 4px;
      font-size: 0.9rem;

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
      }
    }
  }
}
</style>
```
