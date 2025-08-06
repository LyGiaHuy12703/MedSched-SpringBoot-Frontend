<template>
  <div class="detail-user">
    <va-card stripe stripe-color="primary">
      <va-card-title class="header">
        <va-icon name="person" color="primary" class="mr-2" />
        <h1 class="va-h4">Chi tiết nhân viên</h1>
      </va-card-title>
      <va-card-content class="content">
        <div v-if="staffData" class="detail-grid">
          <!-- Tên người dùng -->
          <div class="detail-item">
            <div class="label">
              <va-icon name="person" size="small" class="mr-1" />
              Tên người dùng
            </div>
            <p class="value">{{ staffData.user.name || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Email -->
          <div class="detail-item">
            <div class="label">
              <va-icon name="email" size="small" class="mr-1" />
              Email
            </div>
            <p class="value">{{ staffData.user.email || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Số điện thoại -->
          <div class="detail-item">
            <div class="label">
              <va-icon name="phone" size="small" class="mr-1" />
              Số điện thoại
            </div>
            <p class="value">{{ staffData.user.phone || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Địa chỉ -->
          <div class="detail-item">
            <div class="label">
              <va-icon name="badge" size="small" class="mr-1" />
              Địa chỉ
            </div>
            <p class="value">{{ staffData.user.address || 'Không có dữ liệu' }}</p>
          </div>

          <!-- Trạng thái hoạt động -->
          <div class="detail-item">
            <div class="label">
              <va-icon name="check_circle" size="small" class="mr-1" />
              Trạng thái hoạt động
            </div>
            <p class="value">{{ staffData.user.active ? 'Đang hoạt động' : 'Không hoạt động' }}</p>
          </div>
          <div v-if="staffData" class="detail-item">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1" />
              Ngày sinh
            </div>
            <p class="value">{{ staffData.user.dob || 'Không có dữ liệu' }}</p>
          </div>
          <div v-if="staffData" class="detail-item">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1" />
              Ngày sinh
            </div>
            <p class="value">{{ staffData.user.gender || 'Không có dữ liệu' }}</p>
          </div>
          <div v-if="staffData" class="detail-item">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1" />
              Ảnh đại diện
            </div>
            <va-avatar :src="staffData.user.avatar || '/defaultAvatar.png'"></va-avatar>
          </div>
        </div>
        <div v-if="staffData" class="detail-item mt-3">
          <div class="label">
            <va-icon name="date_range" size="small" class="mr-1" />
            Chuyên khoa
          </div>
          <p class="value">{{ staffData?.departments?.name || 'Không có dữ liệu' }}</p>
        </div>
        <div v-if="staffData" class="detail-item mt-3">
          <div class="label">
            <va-icon name="date_range" size="small" class="mr-1" />
            Ngày tạo
          </div>
          <p class="value">{{ staffData.user.createdAt || 'Không có dữ liệu' }}</p>
        </div>
        <div v-if="staffData" class="detail-item mt-3">
          <div class="label">
            <va-icon name="shield" size="small" class="mr-1" />
            Vai trò
          </div>
          <p class="value">{{ staffData?.roles.map((role) => role.name) || 'Không có dữ liệu' }}</p>
        </div>
      </va-card-content>
      <va-card-actions align="right" class="actions">
        <va-button color="secondary" outline @click="$emit('close-modal-staff')">
          <va-icon name="close" class="mr-2" />
          Đóng
        </va-button>
      </va-card-actions>
    </va-card>
  </div>
</template>
<script lang="ts" setup>
import type { Staff } from '@/interfaces/staff.interface'
const props = defineProps<{
  staffData: Staff
}>()
const staffData = props.staffData
</script>
<style scoped lang="scss">
.detail-user {
  padding: 1.5rem;

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }

  .content {
    padding: 1.5rem;
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
}
</style>
