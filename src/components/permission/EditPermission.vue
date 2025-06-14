<template>
  <div class="permission-edit">
    <VaCard stripe stripe-color="primary">
      <VaCardTitle class="header">
        <VaIcon name="lock" color="primary" class="mr-2" />
        <h1 class="va-h4">Chỉnh sửa quyền hạn</h1>
      </VaCardTitle>
      <VaCardContent class="content">
        <VaForm ref="formRef" class="form-group">
          <div class="edit-grid">
            <div class="edit-item">
              <div class="label"><VaIcon name="tag" size="small" class="mr-1" /> Tên quyền hạn</div>
              <VaInput
                v-model="permissionData.name"
                placeholder="Nhập tên quyền hạn"
                :rules="[(v) => !!v || 'Tên quyền hạn là bắt buộc']"
                required-mark
              />
            </div>
            <div class="edit-item">
              <div class="label">
                <VaIcon name="link" size="small" class="mr-1" />
                Đường dẫn API
              </div>
              <VaInput
                v-model="permissionData.apiPath"
                placeholder="Nhập tên apiPath"
                :rules="[(v) => !!v || 'apiPath là bắt buộc']"
                required-mark
              />
            </div>
            <div class="edit-item">
              <div class="label">
                <VaIcon name="folder" size="small" class="mr-1" />
                Module
              </div>
              <VaSelect
                v-model="permissionData.module"
                :options="moduleOptions"
                placeholder="Nhập tên module"
                :rules="[(v) => !!v || 'Module là bắt buộc']"
                required-mark
                value-by="value"
                text-by="text"
              />
            </div>
            <div class="edit-item">
              <div class="label">
                <VaIcon name="code" size="small" class="mr-1" />
                Phương thức
              </div>

              <VaSelect
                v-model="permissionData.method"
                :options="methodOptions"
                placeholder="Chọn phương thức"
                :rules="[(v) => !!v || 'Phương thức là bắt buộc']"
                required-mark
                value-by="value"
                text-by="text"
              />
            </div>
          </div>
        </VaForm>
      </VaCardContent>
      <VaCardActions class="actions">
        <VaButton @click="onSave" color="primary">Chỉnh sửa</VaButton>
        <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
      </VaCardActions>
    </VaCard>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Permission } from '@/interfaces/permission.interface'
import { usePermissionStore } from '@/stores/permission.store'

const permissionStore = usePermissionStore()
const props = defineProps<{
  permissionData: Permission
}>()
const permissionData = props.permissionData
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)

const moduleOptions = ref<string[]>([])

onMounted(async () => {
  const response = await permissionStore.fetchModuleInPermission()
  moduleOptions.value = response?.data?.data || []
})
const emit = defineEmits(['edit-permission', 'close-modal'])
const onSave = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('edit-permission', permissionData)
}
const methodOptions = ref([
  { text: 'GET', value: 'GET' },
  { text: 'POST', value: 'POST' },
  { text: 'PUT', value: 'PUT' },
  { text: 'DELETE', value: 'DELETE' },
])
</script>
<style scoped lang="scss">
.permission-edit {
  padding: 1.5rem;

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }

  .content {
    padding: 1.5rem;
  }

  .edit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .edit-item {
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
