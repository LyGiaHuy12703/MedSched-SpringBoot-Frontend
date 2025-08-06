<template>
  <va-inner-loading :loading="loading">
    <va-modal
      v-model="localShowModal"
      size="medium"
      hide-default-actions
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
              <span class="value">{{ genderText }}</span>
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
            <h3 class="section-title">Dịch vụ đã chọn</h3>
          </div>
          <div class="services-list">
            <div v-for="service in services" :key="service.id" class="service-item">
              <span class="service-name">{{ service.name }}</span>
              <span class="service-cost"> {{ formatPrice(service.price) }} VND </span>
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
            <span class="total-amount"> {{ formatPrice(totalCost) }} VND </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <va-button
            preset="secondary"
            @click="emit('update:modelValue', false)"
            class="action-btn cancel-btn"
          >
            Hủy bỏ
          </va-button>
          <va-button
            preset="primary"
            @click="emit('confirm')"
            class="action-btn confirm-btn"
            :loading="loading"
          >
            Xác nhận & Đặt lịch
          </va-button>
        </div>
      </template>
    </va-modal>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Staff } from '@/interfaces/staff.interface'
import type { Service } from '@/interfaces/service.interfaces'
import type { AppointmentRequest } from '@/interfaces/appointment.interfaces'

// --- Props ---
const props = defineProps<{
  modelValue: boolean
  patientForm: AppointmentRequest
  selectedDoctorInfo: Staff | null
  selectedDate: string
  selectedTime: string
  services: Service[]
  loading: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

// --- Local State ---
const localShowModal = ref(props.modelValue)

// --- Watchers to sync v-model ---
watch(
  () => props.modelValue,
  (val) => {
    localShowModal.value = val
  },
)

watch(localShowModal, (val) => {
  if (!val && props.modelValue) {
    emit('update:modelValue', false)
  }
})

// --- Helper Functions & Computed Properties ---
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatPrice = (price: number) => {
  if (price == null) return '0'
  return new Intl.NumberFormat('vi-VN').format(price)
}

const totalCost = computed(() => {
  if (!props.services) return 0
  return props.services.reduce((sum, service) => sum + service.price, 0)
})

const genderText = computed(() => {
  if (!props.patientForm) {
    return 'Không xác định'
  }
  const options = [
    { value: 'MALE', text: 'Nam' },
    { value: 'FEMALE', text: 'Nữ' },
    { value: 'OTHER', text: 'Khác' },
  ]
  return options.find((g) => g.value === props.patientForm.gender)?.text || 'Không xác định'
})
</script>

<style lang="scss" scoped>
.confirmation-modal {
  --modal-bg: #ffffff;
  --primary-color: #154ec1; // Using a consistent primary color
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --border-color: #e5e7eb;

  .modal-header {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: #f9fafb; // Lighter background
    border-bottom: 1px solid var(--border-color);

    .header-icon {
      width: 48px;
      height: 48px;
      background: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .header-content {
      margin-left: 1rem;
      .modal-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      .modal-subtitle {
        font-size: 0.9rem;
        color: var(--secondary-color);
        margin-top: 0.25rem;
      }
    }
  }

  .confirmation-content {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .info-section {
      background: var(--modal-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);

      .section-header {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary-color);
          margin: 0 0 0 0.5rem;
        }
      }

      .info-grid,
      .appointment-details {
        display: grid;
        gap: 1rem;
        padding: 1rem;
      }

      .info-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .info-item,
      .detail-item {
        display: flex;
        flex-direction: column;
        .label {
          font-size: 0.85rem;
          color: var(--secondary-color);
        }
        .value {
          font-size: 1rem;
          font-weight: 500;
          color: #1f2937;
        }
      }

      .doctor-card {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 1rem;
        .doctor-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-color);
        }
        .doctor-details {
          .doctor-name {
            font-size: 1.1rem;
            font-weight: 600;
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
        padding: 0.5rem 1rem 1rem;
        .service-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px dashed var(--border-color);
          &:last-child {
            border-bottom: none;
          }
          .service-name {
            font-weight: 500;
          }
          .service-cost {
            font-weight: 600;
            color: var(--success-color);
          }
        }
      }

      .reason-box {
        padding: 1rem;
        .reason-text {
          margin: 0;
          line-height: 1.6;
        }
      }
    }

    .total-section {
      .total-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: var(--success-color);
        border-radius: 8px;
        color: white;
        .total-label {
          font-size: 1.1rem;
          font-weight: 500;
        }
        .total-amount {
          font-size: 1.3rem;
          font-weight: 700;
        }
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: #f9fafb;
    border-top: 1px solid var(--border-color);

    .action-btn {
      font-weight: 500;
      border-radius: 6px;
    }
  }
}
</style>
