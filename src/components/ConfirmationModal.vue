<template>
  <va-inner-loading :loading="loading">
    <va-modal
      v-model="localShowModal"
      size="medium"
      hide-default-actions
      @close="$emit('cancel')"
      class="confirmation-modal"
    >
      <template #header>
        <div class="modal-header">
          <div class="header-icon">
            <va-icon name="event_available" size="large" />
          </div>
          <div class="header-content">
            <h2 class="modal-title">Xác nhận lịch hẹn</h2>
            <p class="modal-subtitle">Kiểm tra thông tin trước khi hoàn tất</p>
          </div>
        </div>
      </template>

      <div class="confirmation-content">
        <!-- Patient Information Section -->
        <div class="info-section">
          <div class="section-header">
            <va-icon name="person_outline" color="primary" />
            <h3 class="section-title">Thông tin bệnh nhân</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Họ và tên</span>
              <span class="value">{{ patientForm.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Giới tính</span>
              <span class="value">
                {{
                  genderOptions.find((g) => g.value === patientForm.gender)?.text ||
                  'Không xác định'
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Ngày sinh</span>
              <span class="value">{{ formatDate(patientForm.dob) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Số điện thoại</span>
              <span class="value">{{ patientForm.phoneReceiveInfo }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email</span>
              <span class="value">{{ patientForm.emailReceiveInfo }}</span>
            </div>
          </div>
        </div>

        <!-- Doctor Information Section -->
        <div class="info-section">
          <div class="section-header">
            <va-icon name="medical_services" color="primary" />
            <h3 class="section-title">Thông tin bác sĩ</h3>
          </div>
          <div class="doctor-card">
            <div class="avatar-container">
              <img
                :src="selectedDoctorInfo?.user?.avatar || '/defaultAvatar.png'"
                :alt="selectedDoctorInfo?.user?.name"
                class="doctor-avatar"
              />
            </div>
            <div class="doctor-details">
              <h4 class="doctor-name">{{ selectedDoctorInfo?.user?.name || 'Không xác định' }}</h4>
              <p class="doctor-specialty">{{ selectedDoctorInfo?.departments?.name }}</p>
              <div class="doctor-stats">
                <span class="rating">
                  <va-icon name="star" color="warning" size="small" />
                  {{ selectedDoctorInfo?.rating || 0 }}/5
                </span>
                <span class="experience"
                  >{{ selectedDoctorInfo?.experienceYear || 0 }} năm kinh nghiệm</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Appointment Details Section -->
        <div class="info-section">
          <div class="section-header">
            <va-icon name="calendar_today" color="primary" />
            <h3 class="section-title">Chi tiết lịch hẹn</h3>
          </div>
          <div class="appointment-details">
            <div class="detail-item">
              <span class="label">Ngày khám</span>
              <span class="value">{{ formatDate(selectedDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Giờ khám</span>
              <span class="value">{{ selectedTime.substring(0, 5) }}</span>
            </div>
          </div>
        </div>

        <!-- Services Section -->
        <div class="info-section">
          <div class="section-header">
            <va-icon name="medication" color="primary" />
            <h3 class="section-title">Dịch vụ khám</h3>
          </div>
          <div class="services-list">
            <div v-for="serviceId in selectedServiceIds" :key="serviceId" class="service-item">
              <span class="service-name">{{ services.find((s) => s.id === serviceId)?.name }}</span>
              <span class="service-cost">
                {{ formatPrice(services.find((s) => s.id === serviceId)?.price || 0) }} VND
              </span>
            </div>
          </div>
        </div>

        <!-- Reason Section -->
        <div class="info-section">
          <div class="section-header">
            <va-icon name="description" color="primary" />
            <h3 class="section-title">Lý do khám</h3>
          </div>
          <div class="reason-box">
            <p class="reason-text">{{ patientForm.reason }}</p>
          </div>
        </div>

        <!-- Total Cost Section -->
        <div class="total-section">
          <div class="total-card">
            <span class="total-label">Tổng chi phí</span>
            <span class="total-amount">
              {{
                formatPrice(
                  selectedServiceIds.reduce(
                    (sum, id) => sum + (services.find((s) => s.id === id)?.price || 0),
                    0,
                  ),
                )
              }}
              VND
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <va-button preset="secondary" @click="$emit('cancel')" class="action-btn cancel-btn">
            Hủy bỏ
          </va-button>
          <va-button preset="primary" @click="$emit('confirm')" class="action-btn confirm-btn">
            Xác nhận
          </va-button>
        </div>
      </template>
    </va-modal>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Staff } from '@/interfaces/staff.interface'

// Define props using defineProps with TypeScript
const props = defineProps<{
  showModal: boolean
  patientForm: {
    name: string
    gender: string
    dob: string
    phoneReceiveInfo: string
    emailReceiveInfo: string
    reason: string
  }
  genderOptions: { value: string; text: string }[]
  selectedDoctor: string
  selectedDoctorInfo: Staff | null
  selectedDate: string
  selectedTime: string
  selectedServiceIds: string[]
  services: { id: string; name: string; price: number }[]
  staffs: Staff[]
  formatDate: (dateStr: string) => string
  formatPrice: (price: number) => string
  loading: boolean
}>()
const emit = defineEmits(['confirm', 'cancel'])

// Local ref for modal visibility
const localShowModal = ref(props.showModal)

// Watch for prop changes to update local ref
watch(
  () => props.showModal,
  (val) => {
    localShowModal.value = val
  },
)

// Watch for local changes to emit cancel when closed
watch(localShowModal, (val) => {
  if (!val && props.showModal) {
    emit('cancel')
  }
})
</script>

<style lang="scss" scoped>
.confirmation-modal {
  $success-color: #10b981;
  --modal-bg: #ffffff;
  --primary-color: #4a90e2;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --border-color: #e5e7eb;

  .modal-header {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border-bottom: 1px solid var(--border-color);
    border-radius: 8px 8px 0 0;

    .header-icon {
      width: 48px;
      height: 48px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);

      .va-icon {
        color: white;
      }
    }

    .header-content {
      margin-left: 1rem;

      .modal-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary-color);
        margin: 0;
      }

      .modal-subtitle {
        font-size: 0.9rem;
        color: var(--secondary-color);
        margin: 0.25rem 0 0;
      }
    }
  }

  .confirmation-content {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
    background: var(--modal-bg);

    .info-section {
      margin-bottom: 1.5rem;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color);

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);

        .section-title {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--primary-color);
          margin: 0 0 0 0.5rem;
        }
      }

      .info-grid,
      .appointment-details {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
      }

      .info-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .info-item,
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .label {
          font-size: 0.9rem;
          color: var(--secondary-color);
          font-weight: 500;
        }

        .value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 500;
        }
      }

      .doctor-card {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 1rem;

        .avatar-container {
          .doctor-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-color);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }

        .doctor-details {
          .doctor-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.25rem;
          }

          .doctor-specialty {
            font-size: 0.9rem;
            color: var(--primary-color);
            margin: 0 0 0.5rem;
          }

          .doctor-stats {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.85rem;
            color: var(--secondary-color);

            .rating,
            .experience {
              display: flex;
              align-items: center;
              gap: 0.25rem;
            }
          }
        }
      }

      .appointment-details {
        grid-template-columns: 1fr 1fr;
      }

      .services-list {
        padding: 1rem;

        .service-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid var(--border-color);

          &:last-child {
            margin-bottom: 0;
          }

          .service-name {
            font-size: 0.95rem;
            color: #1f2937;
            font-weight: 500;
          }

          .service-cost {
            font-size: 0.95rem;
            color: #10b981;
            font-weight: 600;
          }
        }
      }

      .reason-box {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 6px;
        border-left: 4px solid var(--primary-color);

        .reason-text {
          font-size: 0.95rem;
          color: #1f2937;
          line-height: 1.5;
          margin: 0;
        }
      }
    }

    .total-section {
      margin-top: 1.5rem;

      .total-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #10b981;
        border-radius: 8px;
        color: white;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);

        .total-label {
          font-size: 1.1rem;
          font-weight: 500;
        }

        .total-amount {
          font-size: 1.3rem;
          font-weight: 600;
        }
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--modal-bg);
    border-top: 1px solid var(--border-color);
    border-radius: 0 0 8px 8px;

    .action-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    .cancel-btn {
      background-color: #f3f4f6;
      color: #374151;

      &:hover {
        background-color: #e5e7eb;
      }
    }

    .confirm-btn {
      background: #10b981;
      color: white;

      &:hover {
        background: darken(#10b981, 5%);
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .confirmation-modal {
    .modal-header {
      flex-direction: column;
      text-align: center;
      padding: 1rem;

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .header-content {
        margin-left: 0;

        .modal-title {
          font-size: 1.3rem;
        }

        .modal-subtitle {
          font-size: 0.85rem;
        }
      }
    }

    .confirmation-content {
      padding: 1rem;

      .info-section {
        .info-grid,
        .appointment-details {
          grid-template-columns: 1fr;
        }

        .doctor-card {
          flex-direction: column;
          text-align: center;

          .avatar-container {
            margin-bottom: 0.5rem;
          }
        }
      }

      .total-section .total-card {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }

    .modal-actions {
      flex-direction: column;
      gap: 0.5rem;

      .action-btn {
        width: 100%;
      }
    }
  }
}

@media (max-width: 480px) {
  .confirmation-modal {
    .confirmation-content {
      .info-section {
        .section-header .section-title {
          font-size: 1rem;
        }

        .doctor-card .doctor-name {
          font-size: 1rem;
        }
      }

      .total-section .total-card .total-amount {
        font-size: 1.1rem;
      }
    }
  }
}
</style>
