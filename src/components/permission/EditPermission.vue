<template>
  <div class="permission-edit">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header">
        <va-icon name="lock" color="primary" class="mr-2" />
        <h1 class="va-h4">Chỉnh sửa quyền hạn</h1>
      </va-card-title>
      <va-card-content class="content">
        <va-form ref="formRef" class="form-group">
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="tag" size="small" class="mr-1" /> Tên quyền hạn
              </div>
              <va-input
                v-model="permissionData.name"
                placeholder="Nhập tên quyền hạn"
                :rules="[(v) => !!v || 'Tên quyền hạn là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="link" size="small" class="mr-1" /> Đường dẫn API
              </div>
              <va-input
                v-model="permissionData.apiPath"
                placeholder="Nhập tên apiPath"
                :rules="[(v) => !!v || 'apiPath là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label"><va-icon name="folder" size="small" class="mr-1" /> Module</div>
              <va-select
                v-model="permissionData.module"
                :options="moduleOptions"
                placeholder="Chọn module"
                :rules="[(v) => !!v || 'Module là bắt buộc']"
                required-mark
                value-by="value"
                text-by="text"
                class="select-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label"><va-icon name="code" size="small" class="mr-1" /> Phương thức</div>
              <va-select
                v-model="permissionData.method"
                :options="methodOptions"
                placeholder="Chọn phương thức"
                :rules="[(v) => !!v || 'Phương thức là bắt buộc']"
                required-mark
                value-by="value"
                text-by="text"
                class="select-field"
                dense
              />
            </div>
          </div>
        </va-form>
      </va-card-content>
      <va-card-actions class="actions">
        <va-button @click="onSave" color="primary" class="action-button">Chỉnh sửa</va-button>
        <va-button @click="$emit('close-modal')" color="secondary" class="action-button"
          >Hủy</va-button
        >
      </va-card-actions>
    </va-card>
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

    .input-field,
    .select-field {
      border-radius: 4px;
      border: 1px solid var(--va-background-border);
      transition: border-color 0.2s ease;

      &:focus-within {
        border-color: var(--va-primary);
      }
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
