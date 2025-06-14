<template>
  <div class="add-department">
    <va-card>
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="business" color="primary" class="mr-2"></va-icon>
          <h1 class="va-h4">Dữ liệu bộ phận</h1>
        </va-card-title>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="label" size="small" class="mr-1"></va-icon> Tên bộ phận
            </div>
            <p>{{ departmentData.name }}</p>
          </div>
        </div>
        <div class="add-grid mt-3">
          <div class="add-item">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1"></va-icon> Mô tả
            </div>
            <p>{{ departmentData.description }}</p>
          </div>
        </div>
        <div class="add-grid mt-3">
          <div class="add-item full-width">
            <div class="label">
              <va-icon name="medical_services" size="small" class="mr-1"></va-icon> Dịch vụ
            </div>
            <ul v-if="departmentData.services && departmentData.services.length > 0">
              <li v-for="service in departmentData.services" :key="service.id">
                {{ service.name }} ({{ service.price }} VNĐ)
              </li>
            </ul>
            <p v-else>Không có dịch vụ nào được liên kết.</p>
          </div>
        </div>
        <VaCardActions class="actions">
          <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
        </VaCardActions>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { Department } from '@/interfaces/department.interface'

const props = defineProps<{
  departmentData: Department
}>()
const departmentData = props.departmentData
</script>

<style scoped lang="scss">
.add-department {
  padding: 1.5rem;

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--va-primary);
    margin-bottom: 1rem;
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;

    &.mt-3 {
      margin-top: 1.5rem;
    }
  }

  .add-item {
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

    &.full-width {
      grid-column: 1 / -1;
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
    }

    ul {
      list-style-type: disc;
      padding-left: 1.5rem;
    }
  }

  .actions {
    display: flex;
    justify-content: end !important;
    text-align: right;
    padding: 1rem 0;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
}
</style>
