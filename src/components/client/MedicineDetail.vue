<template>
  <div class="medicine-detail">
    <div class="modal-content">
      <h4 class="modal-header">Thông tin chi tiết về thuốc: {{ medicine.name }}</h4>
      <div class="modal-section">
        <h3 class="modal-section-title">Thông tin cơ bản</h3>
        <div class="info-grid">
          <p><strong>Tên thuốc:</strong> {{ medicine.name }}</p>
          <p><strong>Mô tả:</strong> {{ medicine.description }}</p>
          <p><strong>Dạng bào chế:</strong> {{ medicine.formulation || 'Chưa có thông tin' }}</p>
          <p>
            <strong>Nhóm điều trị:</strong> {{ medicine.therapeuticGroup || 'Chưa có thông tin' }}
          </p>
          <p>
            <strong>Giá:</strong>
            {{ medicine.price ? `${medicine.price.toLocaleString()} VNĐ` : 'Chưa có thông tin' }}
          </p>
        </div>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Chỉ định và liều lượng</h3>
        <div class="info-grid">
          <p>
            <strong>Chỉ định:</strong>
            {{ medicine.indications[0].description || 'Chưa có thông tin' }}
          </p>
          <p>
            <strong>Liều lượng:</strong>
            {{ medicine.dosages[0].description || 'Chưa có thông tin' }}
          </p>
          <p>
            <strong>Tần suất:</strong> {{ medicine.dosages[0].frequency || 'Chưa có thông tin' }}
          </p>
        </div>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Cảnh báo</h3>
        <div class="info-grid">
          <p>
            <strong>Chống chỉ định:</strong>
            {{ medicine.contraindications[0].description || 'Chưa có thông tin' }}
          </p>
          <p>
            <strong>Thận trọng:</strong>
            {{ medicine.cautions[0].description || 'Chưa có thông tin' }}
          </p>
          <p>
            <strong>Tác dụng phụ:</strong>
            {{ medicine.sideEffects[0].description || 'Chưa có thông tin' }}
          </p>
        </div>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Thông tin khác</h3>
        <div class="info-grid">
          <p><strong>Ghi chú:</strong> {{ medicine.notes || 'Không có' }}</p>
          <p v-if="medicine.referenceDocuments">
            <strong>Tài liệu tham khảo:</strong>
            <a
              :href="medicine.referenceDocuments"
              target="_blank"
              class="text-blue-500 hover:text-blue-600 transition-colors"
              >Xem tài liệu</a
            >
          </p>
          <p><strong>Cập nhật lần cuối:</strong> {{ formatDate(medicine.updatedAt) }}</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <va-button preset="secondary" class="close-button" @click="$emit('close')">Đóng</va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VaButton } from 'vuestic-ui'
import type { Medicine } from '@/interfaces/medicine.interface'

defineProps<{
  medicine: Medicine
}>()

defineEmits<{
  (e: 'close'): void
}>()

const formatDate = (date?: string) => {
  if (!date) return 'Chưa có thông tin'
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style lang="scss" scoped>
.medicine-detail {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 1rem;

  .modal-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .modal-header {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #4fd1c5;
      text-align: center;
      position: relative;
    }

    .modal-section {
      padding: 1rem 0;
      border-bottom: 1px solid #edf2f7;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      .modal-section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 1rem;
        padding-left: 1.25rem;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: linear-gradient(to bottom, #4fd1c5, #3bada1);
          border-radius: 3px;
        }
      }

      p {
        font-size: 0.9rem;
        color: #4a5568;
        margin: 0.5rem 0;
        line-height: 1.6;
        display: flex;
        align-items: flex-start;

        strong {
          color: #2d3748;
          font-weight: 500;
          min-width: 140px;
          margin-right: 0.75rem;
        }

        a {
          font-weight: 500;
          color: #3b82f6;
          text-decoration: none;
          transition: all 0.3s ease;

          &:hover {
            color: #2563eb;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .modal-footer {
    border-top: 1px solid #edf2f7;
    display: flex;
    justify-content: flex-end;

    .va-button {
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #2d3748;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      transition: all 0.3s ease;

      &:hover {
        background: #4fd1c5;
        color: #ffffff;
        border-color: #4fd1c5;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0.5rem;

    .modal-content {
      padding: 1rem;

      .modal-header {
        font-size: 1.25rem;
      }

      .modal-section {
        .modal-section-title {
          font-size: 1.1rem;
        }

        p {
          font-size: 0.85rem;

          strong {
            min-width: 120px;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      padding: 0.75rem;

      .modal-header {
        font-size: 1.1rem;
      }

      .modal-section {
        .modal-section-title {
          font-size: 1rem;
          padding-left: 1rem;

          &::before {
            width: 4px;
          }
        }

        p {
          font-size: 0.8rem;

          strong {
            min-width: 100px;
          }
        }
      }
    }
  }
}
</style>
