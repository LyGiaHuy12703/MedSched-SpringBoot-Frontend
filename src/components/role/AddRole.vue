<template>
  <div class="role-add">
    <VaCard stripe stripe-color="primary">
      <VaCardTitle class="header">
        <VaIcon name="shield" color="primary" class="mr-2" />
        <h1 class="va-h4">Thêm vai trò</h1>
      </VaCardTitle>
      <VaCardContent class="content">
        <VaForm ref="formRef" class="form-group">
          <div class="add-grid">
            <div class="add-item">
              <div class="label"><VaIcon name="tag" size="small" class="mr-1" /> Tên vai trò</div>
              <VaInput
                v-model="roleData.name"
                placeholder="Nhập tên vai trò"
                :rules="[(v) => !!v || 'Tên vai trò là bắt buộc']"
                required-mark
              />
            </div>
            <div class="add-item">
              <div class="label"><VaIcon name="description" size="small" class="mr-1" /> Mô tả</div>
              <VaInput
                v-model="roleData.description"
                placeholder="Nhập mô tả vai trò"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
                required-mark
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <VaIcon name="lock" size="small" class="mr-1" /> Quyền hạn
                <VaButton
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearPermissions"
                >
                  Xóa tất cả
                </VaButton>
              </div>
              <VaSelect
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
              />
            </div>
          </div>
        </VaForm>
      </VaCardContent>
      <VaCardActions class="actions">
        <VaButton @click="onSave" color="primary">Lưu</VaButton>
        <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
      </VaCardActions>
    </VaCard>
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

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
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
  }

  .permission-item {
    grid-column: span 2; /* Permissions field spans two columns for more space */
  }

  .actions {
    padding: 1rem 1.5rem;
  }
}
</style>
