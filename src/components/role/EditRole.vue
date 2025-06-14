<template>
  <div class="role-detail">
    <va-card stripe stripe-color="primary">
      <va-card-title class="header">
        <va-icon name="shield" color="primary" class="mr-2" />
        <h1 class="va-h4">Chỉnh sửa vai trò</h1>
      </va-card-title>
      <va-card-content class="content">
        <va-form ref="formRef" class="form-group">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="label"><VaIcon name="tag" size="small" class="mr-1" /> Tên vai trò</div>
              <VaInput
                v-model="formData.name"
                placeholder="Nhập tên vai trò"
                :rules="[(v) => !!v || 'Tên vai trò là bắt buộc']"
                required-mark
              />
            </div>
            <div class="detail-item">
              <div class="label">
                <VaIcon name="description" size="small" class="mr-1" /> Mô tả vai trò
              </div>
              <VaInput
                v-model="formData.description"
                placeholder="Nhập tên vai trò"
                :rules="[(v) => !!v || 'Tên vai trò là bắt buộc']"
                required-mark
              />
            </div>
          </div>
          <div class="detail-grid mt-3">
            <div class="detail-item">
              <div class="label">
                <va-icon name="lock" />
                Danh sách các api quyền hạn
              </div>
              <VaSelect
                v-model="formData.permissions"
                :options="
                  permissionOptions.map((permission: Permission) => ({
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
              />
            </div>
          </div>
        </va-form>
      </va-card-content>
      <va-card-actions align="right" class="actions">
        <VaButton color="secondary" outline @click="$emit('close-modal')">
          <VaIcon name="close" class="mr-2" />
          Đóng
        </VaButton>
        <VaButton color="primary" outline @click="handleEdit">
          <VaIcon name="check" class="mr-2" />
          Cập nhật
        </VaButton>
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
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
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

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }
  .chip-status {
    display: flex;
    justify-content: end;
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
