```vue
<template>
  <div class="role-detail">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header">
        <va-icon name="shield" color="primary" class="mr-2" />
        <h1 class="va-h4">Chỉnh sửa vai trò</h1>
      </va-card-title>
      <va-card-content class="content">
        <va-form ref="formRef" class="form-group">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="label"><va-icon name="tag" size="small" class="mr-1" /> Tên vai trò</div>
              <va-input
                v-model="formData.name"
                placeholder="Nhập tên vai trò"
                :rules="[(v) => !!v || 'Tên vai trò là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="detail-item">
              <div class="label"><va-icon name="description" size="small" class="mr-1" /> Mô tả vai trò</div>
              <va-input
                v-model="formData.description"
                placeholder="Nhập mô tả vai trò"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
          </div>
          <div class="detail-grid mt-3">
            <div class="detail-item">
              <div class="label">
                <va-icon name="lock" size="small" class="mr-1" />
                Danh sách các api quyền hạn
              </div>
              <va-select
                v-model="formData.permissions"
                :options="
                  permissionOptions.map((permission) => ({
                    text: permission.name,
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
      <va-card-actions align="right" class="actions">
        <va-button color="secondary" outline @click="$emit('close-modal')">
          <va-icon name="close" class="mr-2" />
          Đóng
        </va-button>
        <va-button color="primary" outline @click="handleEdit">
          <va-icon name="check" class="mr-2" />
          Cập nhật
        </va-button>
      </va-card-actions>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { UpdateRoleRequest, Role } from '@/interfaces/role.interface'
import { usePermissionStore } from '@/stores/permission.store'
import type { Permission } from '@/interfaces/permission.interface'

const props = defineProps<{
  roleData: Role
}>()
const formData = ref<UpdateRoleRequest>({
  name: '',
  description: '',
  permissions: [],
})
const roleData = props.roleData
const permissionStore = usePermissionStore()
const permissionOptions = ref<Permission[]>([])
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)

onMounted(async () => {
  await permissionStore.fetchPermissions(0, 1000)
  permissionOptions.value = permissionStore.permissions
  if (roleData) {
    formData.value = {
      name: roleData.name ?? '',
      description: roleData.description ?? '',
      permissions: (roleData.permissions ?? [])
        .map((permission: Permission) => permission.id)
        .filter((id): id is string => typeof id === 'string'),
    }
  }
})

const emit = defineEmits(['close-modal', 'edit-role'])

const handleEdit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('edit-role', roleData.id, formData.value)
}
</script>

<style scoped lang="scss">
.role-detail {
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

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
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

  .actions {
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
    .detail-grid {
      grid-template-columns: 1fr;
    }

    .detail-item {
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
