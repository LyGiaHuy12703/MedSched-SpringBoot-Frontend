```vue
<template>
  <div class="add-service">
    <va-card class="department-card">
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="medical_services" color="primary" class="mr-1"></va-icon>
          <h1 class="va-h4 title-text">Thêm dữ liệu dịch vụ</h1>
        </va-card-title>
        <va-form ref="formRef" @submit.prevent="onSubmit">
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="label" size="small" class="mr-1"></va-icon>
                <span class="label-text">Tên dịch vụ</span>
              </div>
              <va-input
                v-model="serviceData.name"
                placeholder="Nhập tên"
                :rules="[(v) => !!v || 'Bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="attach_money" size="small" class="mr-1"></va-icon>
                <span class="label-text">Giá</span>
              </div>
              <va-input
                v-model.number="serviceData.price"
                type="number"
                placeholder="Nhập giá"
                :rules="[
                  (v) => (v !== null && v !== undefined) || 'Bắt buộc',
                  (v) => Number(v) >= 0 || 'Số không âm',
                ]"
                required-mark
                class="input-field"
                dense
              />
            </div>
          </div>
          <div class="add-grid mt-2">
            <div class="add-item full-width">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1"></va-icon>
                <span class="label-text">Mô tả</span>
              </div>
              <va-textarea
                v-model="serviceData.description"
                placeholder="Nhập mô tả"
                :rules="[(v) => !!v || 'Bắt buộc']"
                class="textarea-field"
                dense
              />
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
            <VaButton
              @click="onSubmit"
              preset="primary"
              color="primary"
              class="action-button action-button-primary"
              >Lưu</VaButton
            >
          </VaCardActions>
        </va-form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { ServiceRequest } from '@/interfaces/service.interfaces'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  serviceData: ServiceRequest
}>()
const serviceData = props.serviceData
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const emit = defineEmits(['save-service', 'close-modal'])

const onSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('save-service', serviceData)
}

const resetServiceData = () => {
  serviceData.name = ''
  serviceData.description = ''
  serviceData.price = 0
}

onMounted(() => {
  resetServiceData()
})
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

    .input-field,
    .textarea-field,
    .select-field {
      border-radius: 4px;
      border: 1px solid var(--va-background-border);
      transition: border-color 0.2s ease;

      &:focus-within {
        border-color: var(--va-primary);
      }
    }

    .textarea-field {
      min-height: 80px;
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

      &.action-button-primary {
        margin-left: 0.5rem;
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

        &.action-button-primary {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
```
