<template>
  <div class="add-department">
    <va-card>
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="business" color="primary" class="mr-2"></va-icon>
          <h1 class="va-h4">Thêm dữ liệu bộ phận</h1>
        </va-card-title>
        <va-form ref="formRef" @submit.prevent="onSubmit">
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="label" size="small" class="mr-1"></va-icon> Tên bộ phận
              </div>
              <va-input
                v-model="localDepartmentData.name"
                placeholder="Nhập tên bộ phận"
                :rules="[(v) => !!v || 'Tên bộ phận là bắt buộc']"
                required-mark
              />
            </div>
          </div>
          <div class="add-grid mt-3">
            <div class="add-item">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1"></va-icon> Mô tả
              </div>
              <va-textarea
                v-model="localDepartmentData.description"
                placeholder="Nhập mô tả bộ phận"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
              />
            </div>
          </div>
          <div class="add-grid mt-3">
            <div class="add-item full-width">
              <div class="label">
                <va-icon name="medical_services" size="small" class="mr-1"></va-icon> Dịch vụ
              </div>
              <va-select
                v-model="localDepartmentData.serviceId"
                :options="serviceOptions"
                :rules="[(v) => (Array.isArray(v) && v.length > 0) || 'Chọn ít nhất một dịch vụ']"
                multiple
                placeholder="Chọn các dịch vụ"
                text-by="name"
                value-by="id"
                searchable
              />
            </div>
          </div>
          <VaCardActions class="actions">
            <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
            <VaButton @click="onSubmit" color="primary">Lưu dữ liệu bộ phận</VaButton>
          </VaCardActions>
        </va-form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useServiceStore } from '@/stores/service.store'
import type { DepartmentRequest } from '@/interfaces/department.interface'

defineProps<{
  departmentData: DepartmentRequest
}>()
const localDepartmentData = ref<DepartmentRequest>({
  name: '',
  description: '',
  serviceId: [],
})
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const emit = defineEmits(['save-department', 'close-modal'])

const serviceStore = useServiceStore()
const serviceOptions = ref<{ id: string; name: string }[]>([])

onMounted(async () => {
  await serviceStore.fetchServices(0, 1000) // Lấy tất cả dịch vụ
  serviceOptions.value = serviceStore.services.map((s) => ({ id: s.id, name: s.name }))
  resetDepartmentData()
})

const resetDepartmentData = () => {
  localDepartmentData.value.name = ''
  localDepartmentData.value.description = ''
  localDepartmentData.value.serviceId = []
}

const onSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('save-department', localDepartmentData.value)
}
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
    transition: transform 0.2s ease-in-out;
    box-shadow: var(--va-box-shadow);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--va-box-shadow-hover);
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
    display: flex !important;
    justify-content: right;
    text-align: right;
    padding: 1rem 0;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
}
</style>
