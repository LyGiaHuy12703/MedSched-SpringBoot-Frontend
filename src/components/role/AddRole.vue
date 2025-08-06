```vue
<template>
  <div class="role-add">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header">
        <va-icon name="shield" color="primary" class="mr-2" />
        <h1 class="va-h4">Thêm vai trò</h1>
      </va-card-title>
      <va-card-content class="content">
        <va-form ref="formRef" class="form-group">
          <div class="add-grid">
            <div class="add-item">
              <div class="label"><va-icon name="tag" size="small" class="mr-1" /> Tên vai trò</div>
              <va-input
                v-model="roleData.name"
                placeholder="Nhập tên vai trò"
                :rules="[(v) => !!v || 'Tên vai trò là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1" /> Mô tả
              </div>
              <va-input
                v-model="roleData.description"
                placeholder="Nhập mô tả vai trò"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="lock" size="small" class="mr-1" /> Quyền hạn
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearPermissions"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="roleData.permissions"
                :options="
                  permissionOptions.map((permission) => ({
                    text: permission.apiPath,
                    value: permission.id,
                  }))
                "
                placeholder="Tìm và chọn module quyền hạn"
                :rules="[
                  (v) =>
                    (Array.isArray(v) && v.length > 0) ||
                    'Vui lòng chọn ít nhất một module quyền hạn',
                ]"
                required-mark
                multiple
                chips
                searchable
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
        <va-button @click="onSave" color="primary" class="action-button">Lưu</va-button>
        <va-button @click="$emit('close-modal')" color="secondary" class="action-button"
          >Hủy</va-button
        >
      </va-card-actions>
    </va-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { CreateRoleRequest } from '@/interfaces/role.interface'
import { usePermissionStore } from '@/stores/permission.store'
import type { Permission } from '@/interfaces/permission.interface'

const permissionStore = usePermissionStore()
const props = defineProps<{
  roleData: CreateRoleRequest
}>()
const roleData = props.roleData
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const permissionOptions = ref<Permission[]>([])

onMounted(async () => {
  resetRoleData()
  await permissionStore.fetchPermissions(0, 1000)
  permissionOptions.value = permissionStore.permissions
})

const emit = defineEmits(['save-role', 'close-modal'])

const onSave = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('save-role', roleData)
}

const resetRoleData = () => {
  roleData.name = ''
  roleData.description = ''
  roleData.permissions = []
}

const clearPermissions = () => {
  roleData.permissions = []
}
</script>

<style scoped lang="scss">
.role-add {
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
  }

  .permission-item {
    grid-column: span 2;
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
```
