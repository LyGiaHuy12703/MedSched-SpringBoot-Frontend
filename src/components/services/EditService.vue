<template>
  <div class="add-service">
    <va-card>
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="medical_services" color="primary" class="mr-2"></va-icon>
          <h1 class="va-h4">Chỉnh sửa dữ liệu dịch vụ</h1>
        </va-card-title>
        <va-form ref="formRef" @submit.prevent="onSubmit">
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="label" size="small" class="mr-1"></va-icon> Tên dịch vụ
              </div>
              <va-input
                v-model="serviceData.name"
                placeholder="Nhập tên dịch vụ"
                :rules="[(v) => !!v || 'Tên dịch vụ là bắt buộc']"
                required-mark
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="attach_money" size="small" class="mr-1"></va-icon> Giá
              </div>
              <va-input
                v-model.number="serviceData.price"
                type="number"
                placeholder="Nhập giá dịch vụ"
                :rules="[
                  (v) => (v !== null && v !== undefined) || 'Giá là bắt buộc',
                  (v) => Number(v) >= 0 || 'Giá phải là số không âm',
                ]"
                required-mark
              />
            </div>
          </div>
          <div class="add-grid mt-3">
            <div class="add-item full-width">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1"></va-icon> Mô tả
              </div>
              <va-textarea
                v-model="serviceData.description"
                placeholder="Nhập mô tả dịch vụ"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
              />
            </div>
          </div>
          <VaCardActions class="actions">
            <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
            <VaButton @click="onSubmit" color="primary">Lưu dữ liệu dịch vụ</VaButton>
          </VaCardActions>
        </va-form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { ServiceRequest } from '@/interfaces/service.interfaces'
import { ref } from 'vue'

const props = defineProps<{
  serviceData: ServiceRequest
}>()
const serviceData = props.serviceData
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const emit = defineEmits(['edit-service', 'close-modal'])

const onSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('edit-service', serviceData)
}
</script>

<style scoped lang="scss">
.add-service {
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
