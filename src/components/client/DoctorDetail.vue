<template>
  <div class="detail-data">
    <!-- Avatar Section -->
    <div class="image-container">
      <div class="avatar-wrapper">
        <img :src="staffData.user.avatar || '/defaultAvatar.png'" alt="Avatar" class="avatar" />
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <h1 class="section-title">Thông tin chi tiết</h1>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="label">
            <va-icon name="person" size="small" class="label-icon" />
            <span>Họ và tên</span>
          </div>
          <p class="value">{{ staffData.user.name || 'Không có dữ liệu' }}</p>
        </div>
        <div class="detail-item">
          <div class="label">
            <va-icon name="person" size="small" class="label-icon" />
            <span>Chuyên khoa</span>
          </div>
          <p class="value">{{ staffData.departments.name || 'Không có dữ liệu' }}</p>
        </div>
        <div class="detail-item">
          <div class="label">
            <va-icon name="phone" size="small" class="label-icon" />
            <span>Số điện thoại</span>
          </div>
          <p class="value">{{ staffData.user.phone || 'Không có dữ liệu' }}</p>
        </div>
        <div class="detail-item">
          <div class="label">
            <va-icon name="badge" size="small" class="label-icon" />
            <span>Địa chỉ</span>
          </div>
          <p class="value">
            {{ staffData.departments.name || 'Không có dữ liệu' }} -
            {{ staffData.user.address || 'Không có dữ liệu' }}
          </p>
        </div>
        <div class="detail-item">
          <div class="label">
            <va-icon name="badge" size="small" class="label-icon" />
            <span>Kinh nghiệm</span>
          </div>
          <p class="value">{{ staffData.experienceYear || 'Không có dữ liệu' }}</p>
        </div>
        <div class="detail-item">
          <div class="label">
            <va-icon name="star" size="small" class="label-icon" />
            <span>Điểm đánh giá</span>
          </div>
          <va-rating class="readonly-rating" halves :model-value="staffData.rating" readonly />
        </div>
      </div>
    </div>

    <!-- Status Section -->
    <div class="status-section">
      <h3 class="section-title">Trạng thái hoạt động</h3>
      <va-chip :color="staffData.user.active ? 'success' : 'danger'" size="small">
        {{ staffData.user.active ? 'Đang hoạt động' : 'Tạm ngừng hoạt động' }}
      </va-chip>
    </div>

    <!-- Actions Section -->
    <div class="actions-section">
      <va-button color="secondary" outline class="close-button" @click="$emit('close-modal')">
        <va-icon name="close" class="mr-2" />
        Đóng
      </va-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Staff } from '@/interfaces/staff.interface'

defineProps<{
  staffData: Staff
}>()
</script>

<style lang="scss" scoped>
.detail-data {
  padding: 1.5rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 64rem; /* max-w-4xl */
  margin-left: auto;
  margin-right: auto;

  .image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;

    .avatar-wrapper {
      position: relative;

      .avatar {
        width: 8rem; /* w-32 */
        height: 8rem; /* h-32 */
        border-radius: 9999px; /* rounded-full */
        border: 4px solid #4fd1c5; /* border-teal-400 */
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.1); /* group-hover:scale-110 */
        }
      }
    }
  }

  .info-section {
    margin-bottom: 1.5rem;

    .section-title {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 700; /* font-bold */
      color: #2d3748; /* text-gray-800 */
      margin-bottom: 1rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem; /* gap-4 */

      .detail-item {
        padding: 1rem; /* p-4 */
        background-color: #ffffff; /* bg-white */
        border-radius: 0.5rem; /* rounded-lg */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* shadow-sm */
        transition: box-shadow 0.2s ease;

        &:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* hover:shadow-md */
        }

        .label {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-weight: 600; /* font-semibold */
          color: #2b6cb0; /* text-gray-700 */

          .label-icon {
            color: #4fd1c5; /* text-teal-500 */
            margin-right: 0.5rem;
          }
        }

        .value {
          font-size: 1rem;
          color: #4a5568; /* text-gray-600 */
        }
      }
    }
  }

  .status-section {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;

    .section-title {
      font-size: 1.25rem; /* text-xl */
      font-weight: 600; /* font-semibold */
      color: #2d3748; /* text-gray-800 */
      margin-right: 1rem; /* mr-4 */
    }
  }

  .actions-section {
    display: flex;
    justify-content: flex-end;

    .close-button {
      display: flex;
      align-items: center;
    }
  }

  .readonly-rating {
    pointer-events: none;
  }
}
</style>
