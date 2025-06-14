<template>
  <va-card class="doctor-card" outlined>
    <va-card-content class="card-content">
      <div class="avatar-section">
        <va-avatar
          :src="avatarSrc"
          size="large"
          class="avatar"
          :alt="`Avatar of ${doctorName}`"
          aria-label="Doctor's avatar"
        />
      </div>

      <!-- Doctor Info -->
      <div class="doctor-info">
        <h3 class="doctor-name">
          <span
            class="doctor-name-link"
            @click="showModalDetail"
            :aria-label="`View profile of ${doctorName}`"
          >
            {{ doctorName }}
          </span>
        </h3>
        <p class="specialty">{{ departmentName }}</p>
        <div class="info-container">
          <p class="info-item">
            <va-icon name="business_center" size="small" class="icon" />
            {{ experienceYear }} năm kinh nghiệm
          </p>
          <p class="info-item">
            <va-icon name="location_on" size="small" class="icon" />
            {{ departmentName }} - {{ doctorAddress }}
          </p>
          <p v-if="props.doctor.user.active !== undefined" class="info-item">
            <va-icon
              :name="props.doctor.user.active ? 'check_circle' : 'cancel'"
              size="small"
              :color="props.doctor.user.active ? 'success' : 'danger'"
              class="icon"
            />
            {{ props.doctor.user.active ? 'Đang hoạt động' : 'Tạm ngừng hoạt động' }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <va-button
          size="small"
          preset="secondary"
          class="action-button view-profile"
          aria-label="View doctor's profile"
          @click="showModalDetail"
        >
          Xem hồ sơ
        </va-button>
        <va-button
          size="small"
          preset="primary"
          class="action-button book-appointment"
          aria-label="Book appointment"
          @click="$emit('book-appointment', props.doctor)"
        >
          Đặt lịch hẹn
        </va-button>
      </div>
    </va-card-content>

    <!-- Modal for Doctor Details -->
    <va-modal
      v-model="isShowModal"
      hide-default-actions
      @close="onCloseModal"
      aria-label="Doctor details modal"
    >
      <DoctorDetail :staff-data="props.doctor" @close-modal="onCloseModal" />
    </va-modal>
  </va-card>
</template>

<script setup lang="ts">
import type { Staff } from '@/interfaces/staff.interface'
import { computed, ref } from 'vue'
import DoctorDetail from './DoctorDetail.vue'

const props = defineProps<{
  doctor: Staff
}>()

defineEmits(['book-appointment'])

const isShowModal = ref(false)

const avatarSrc = computed(() => props.doctor.user.avatar || '/defaultAvatar.png')
const doctorName = computed(() => props.doctor.user.name || 'Không có tên')
const departmentName = computed(
  () => props.doctor.departments?.name || 'Chuyên khoa không xác định',
)
const experienceYear = computed(() => props.doctor.experienceYear || 'Chưa xác định')
const doctorAddress = computed(() => props.doctor.user.address || 'Không xác định')

const showModalDetail = () => {
  isShowModal.value = true
}

const onCloseModal = () => {
  isShowModal.value = false
}
</script>

<style lang="scss" scoped>
.doctor-card {
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  max-width: 350px;
  margin: 0 auto;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
}

.avatar-section {
  position: relative;
  text-align: center;
  margin-bottom: 1rem;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #4fc3f7;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4fc3f7;
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

.doctor-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doctor-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.doctor-name-link {
  cursor: pointer;
  color: #4fc3f7;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #2196f3;
    text-decoration: underline;
  }
}

.specialty {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 500;
  margin: 0;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #757575;

  .icon {
    color: #4fc3f7;
    font-size: 1rem;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-button {
  flex: 1;
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &.view-profile {
    background: transparent;
    border: 1px solid #4fc3f7;
    color: #4fc3f7;

    &:hover {
      background: #4fc3f7;
      color: #ffffff;
    }
  }

  &.book-appointment {
    background: #4fc3f7;
    color: #ffffff;

    &:hover {
      background: #2196f3;
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 480px) {
  .doctor-card {
    max-width: 100%;
  }

  .card-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-section {
    margin-bottom: 1rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
