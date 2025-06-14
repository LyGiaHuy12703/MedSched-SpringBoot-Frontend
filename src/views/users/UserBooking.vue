<template>
  <div class="booking-page">
    <div class="container">
      <!-- Progress Steps -->
      <div class="progress-steps">
        <div
          v-for="step in 5"
          :key="step"
          class="step"
          :class="{ active: step <= currentStep, completed: step < currentStep }"
        >
          <div class="step-number">{{ step }}</div>
          <div class="step-label">
            {{
              step === 1
                ? 'Chọn chuyên khoa'
                : step === 2
                  ? 'Chọn bác sĩ'
                  : step === 3
                    ? 'Chọn lịch khám'
                    : step === 4
                      ? 'Chọn dịch vụ'
                      : 'Thông tin bệnh nhân'
            }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="appointmentStore.loading" class="loading">
        <va-spinner />
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Step 1: Choose Specialty -->
      <div v-else-if="currentStep === 1" class="step-content">
        <h2 class="step-title">Chọn chuyên khoa</h2>
        <div class="specialty-grid">
          <div
            v-for="department in departments"
            :key="department.id"
            class="specialty-card"
            :class="{ active: departmentId === department.id }"
            @click="departmentId = department.id"
          >
            <va-icon :name="department.icon" size="large" />
            <span class="specialty-name">{{ department.name }}</span>
          </div>
        </div>
      </div>

      <!-- Step 2: Choose Doctor -->
      <div v-else-if="currentStep === 2" class="step-content">
        <h2 class="step-title">Chọn bác sĩ</h2>
        <div v-if="staffs.length" class="doctors-grid">
          <div
            v-for="staff in staffs"
            :key="staff.id"
            class="doctor-card"
            :class="{ active: selectedDoctor === staff.id }"
            @click="selectDoctor(staff.id)"
          >
            <img
              :src="staff.user.avatar || '/defaultAvatar.png'"
              :alt="staff.user.name"
              class="doctor-image"
            />
            <div class="doctor-info">
              <h3 class="doctor-name">{{ staff.user.name || 'Không có tên' }}</h3>
              <p class="doctor-specialty">
                {{ staff.departments?.name || 'Không có chuyên khoa' }} -
                {{ staff.position || 'Không có vị trí' }}
              </p>
              <p class="doctor-experience">{{ staff.experienceYear || 0 }} năm kinh nghiệm</p>
              <div class="doctor-rating">
                <va-icon name="star" color="warning" />
                <span>{{ staff.rating || 0 }}/5</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="no-data">Không có bác sĩ trong chuyên khoa này.</p>
        <div class="pagination-container">
          <va-pagination
            v-model="currentPage"
            :total="total"
            :pages="totalPages"
            :rows-per-page="pageSize"
            :rows-per-page-options="[5, 10, 20]"
            :visible-pages="5"
            @update:modelValue="onPageChange"
          />
        </div>
      </div>

      <!-- Step 3: Choose Date & Time -->
      <div v-else-if="currentStep === 3" class="step-content">
        <h2 class="step-title">Chọn lịch khám</h2>
        <div class="datetime-selection">
          <div class="time-slots">
            <div class="label"><va-icon name="schedule" class="mr-2" /> Chọn ngày khám</div>
            <template v-if="listDate.length">
              <div class="time-grid">
                <button
                  v-for="date in listDate"
                  :key="date.id"
                  class="time-slot"
                  :class="{ active: selectedDate === date.date }"
                  @click="selectedDate = date.date"
                >
                  {{ date.date }}
                </button>
              </div>
            </template>
            <div v-else class="no-data">
              <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
              <p>Không có lịch khám cho bác sĩ này trong thời gian tới.</p>
            </div>
          </div>
          <div class="time-slots">
            <div class="label"><va-icon name="schedule" class="mr-2" /> Chọn giờ khám</div>
            <div class="time-grid" v-if="selectedDate && filteredTimes.length">
              <button
                v-for="time in filteredTimes"
                :key="time"
                class="time-slot"
                :class="{ active: selectedTime === time }"
                @click="selectedTime = time"
              >
                {{ time }}
              </button>
            </div>
            <div v-else class="no-data">
              <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
              <p>Không có giờ khám cho ngày này.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Choose Services -->
      <div v-else-if="currentStep === 4" class="step-content">
        <h2 class="step-title">Chọn dịch vụ khám</h2>
        <div class="service-grid">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-card"
            :class="{ active: selectedServiceIds.includes(service.id) }"
            @click="toggleService(service.id)"
          >
            <va-icon name="medical_services" size="large" />
            <div class="service-info">
              <span class="service-name">{{ service.name }}</span>
              <span class="service-price">{{ formatPrice(service.price) }} VND</span>
            </div>
          </div>
        </div>
        <p v-if="!services.length" class="no-data">Không có dịch vụ nào khả dụng.</p>
      </div>

      <!-- Step 5: Patient Information -->
      <div v-else-if="currentStep === 5" class="step-content">
        <h2 class="step-title">Thông tin bệnh nhân</h2>
        <va-form ref="formRef" @submit.prevent="submitBooking" class="patient-form">
          <div class="form-grid">
            <!-- Họ và tên -->
            <div class="form-group">
              <div class="label"><va-icon name="person" class="mr-1" /> Họ và tên</div>
              <va-input
                v-model="patientForm.name"
                type="text"
                :rules="[(v) => !!v.trim() || 'Vui lòng nhập họ và tên']"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <!-- Giới tính -->
            <div class="form-group">
              <div class="label"><va-icon name="wc" class="mr-1" /> Giới tính</div>
              <va-select
                v-model="patientForm.gender"
                :options="genderOptions"
                :rules="[(v) => !!v || 'Vui lòng chọn giới tính']"
                placeholder="Chọn giới tính"
                required
              />
            </div>

            <!-- Số điện thoại -->
            <div class="form-group">
              <div class="label"><va-icon name="phone" class="mr-1" /> Số điện thoại</div>
              <va-input
                v-model="patientForm.phoneReceiveInfo"
                type="tel"
                :rules="[
                  (v) => !!v.trim() || 'Vui lòng nhập số điện thoại',
                  (v) => /^[0-9]{10}$/.test(v) || 'Số điện thoại phải có 10 chữ số',
                ]"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <!-- Ngày sinh -->
            <div class="form-group">
              <div class="label"><va-icon name="schedule" class="mr-1" /> Ngày sinh</div>
              <va-input
                type="date"
                v-model="patientForm.dob"
                :rules="[
                  (v) => !!v || 'Vui lòng chọn ngày sinh',
                  (v) => {
                    const today = new Date()
                    const birthDate = new Date(v)
                    return birthDate <= today || 'Ngày sinh không được là tương lai'
                  },
                ]"
                format="dd/MM/yyyy"
                placeholder="Chọn ngày sinh"
                required
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <div class="label"><va-icon name="email" class="mr-1" /> Email</div>
              <va-input
                v-model="patientForm.emailReceiveInfo"
                type="email"
                :rules="emailRules"
                placeholder="Nhập email"
                required
              />
            </div>

            <!-- Lý do khám bệnh -->
            <div class="form-group full-width">
              <div class="label"><va-icon name="notes" class="mr-1" /> Lý do khám bệnh</div>
              <va-input
                v-model="patientForm.reason"
                type="textarea"
                :rules="[(v) => !!v.trim() || 'Vui lòng nhập lý do khám bệnh']"
                placeholder="Mô tả triệu chứng"
                required
                :rows="4"
              />
            </div>
          </div>
        </va-form>
      </div>

      <!-- Nav Buttons -->
      <div class="step-navigation">
        <va-button v-if="currentStep > 1" preset="secondary" @click="prevStep">
          Quay lại
        </va-button>
        <va-button v-if="currentStep < 5" preset="primary" @click="nextStep"> Tiếp tục </va-button>
        <va-button v-else preset="primary" @click="submitBooking"> Xác nhận đặt lịch </va-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppointmentRequest } from '@/interfaces/appointment.interfaces'
import type { Department } from '@/interfaces/department.interface'
import type { DoctorShift, ScheduleBinding } from '@/interfaces/doctorShift.interfaces'
import type { Staff } from '@/interfaces/staff.interface'
import type { Service } from '@/interfaces/service.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useStaffStore } from '@/stores/staff.store'
import { useServiceStore } from '@/stores/service.store'
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const appointmentStore = useAppointmentStore()
const departmentStore = useDepartmentStore()
const staffStore = useStaffStore()
const scheduleStore = useScheduleStore()
const serviceStore = useServiceStore()

// State
const currentStep = ref<number>(1)
const selectedDoctor = ref('')
const selectedDate = ref<string>('')
const selectedTime = ref<string>('')
const departments = ref<Department[]>([])
const departmentId = ref<string>('')
const staffs = ref<Staff[]>([])
const schedules = ref<DoctorShift[]>([])
const listDate = ref<ScheduleBinding[]>([])
const services = ref<Service[]>([])
const selectedServiceIds = ref<string[]>([])
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const genderOptions = [
  { value: 'MALE', text: 'Nam' },
  { value: 'FEMALE', text: 'Nữ' },
  { value: 'OTHER', text: 'Khác' },
]

// Pagination
const currentPage = ref(staffStore.meta?.page || 1)
const pageSize = ref(staffStore.meta?.pageSize || 6)
const total = ref(staffStore.meta?.total || 0)
const totalPages = ref(staffStore.meta?.pages || 0)

// Available times
const availableTimes = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]
watch(selectedDate, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    selectedTime.value = '' // Reset selectedTime when date changes
  }
})
const filteredTimes = computed(() => {
  if (!selectedDate.value) return [] // No times if no date is selected

  // Find the selected date's time range
  const selectedDateItem = listDate.value.find(
    (item) => item.date === selectedDate.value && item.start && item.end,
  )
  if (!selectedDateItem) return []

  const { start, end } = selectedDateItem

  // Filter availableTimes to only include times within start and end
  return availableTimes.filter((time) => time >= start && time <= end)
})

// Form data
const patientForm = ref<AppointmentRequest>({
  date: '',
  time: '',
  staffId: '',
  doctorShiftId: '',
  reason: '',
  emailReceiveInfo: '',
  phoneReceiveInfo: '',
  dob: '',
  gender: '',
  name: '',
  servicesId: [],
})

// Icon list for departments
const iconList = [
  'local_hospital',
  'healing',
  'medical_services',
  'emergency',
  'health_and_safety',
  'vaccines',
  'science',
  'biotech',
  'monitor_heart',
  'psychology',
]

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email là bắt buộc',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ',
]

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

// Toggle service selection
const toggleService = (serviceId: string) => {
  if (selectedServiceIds.value.includes(serviceId)) {
    selectedServiceIds.value = selectedServiceIds.value.filter((id) => id !== serviceId)
  } else {
    selectedServiceIds.value.push(serviceId)
  }
}

// Fetch initial data
async function fetchInitData() {
  await staffStore.fetchAllStaffs(currentPage.value - 1, 6, departmentId.value)
  await departmentStore.fetchDepartments(0, 1000)
  departments.value = departmentStore.departments
  staffs.value = staffStore.staffs
  total.value = staffStore.meta?.total || 0
  totalPages.value = staffStore.meta?.pages || 0
}

// Fetch services
async function fetchServices() {
  await serviceStore.fetchServices(0, 100, departmentId.value)
  services.value = serviceStore.services
}

// Handle page change
async function onPageChange(page: number) {
  currentPage.value = page
  await fetchInitData()
}

// Handle doctor selection
async function selectDoctor(id: string) {
  selectedDoctor.value = id
  await scheduleStore.fetchAllSchedule(0, 100, id, true)
  schedules.value = scheduleStore.schedules
  listDate.value = schedules.value.map((schedule) => ({
    id: schedule.id,
    start: schedule.startTime,
    end: schedule.endTime,
    date: schedule.dayWork,
  }))
  if (listDate.value.length > 0) {
    selectedDate.value = listDate.value[0].date
    selectedTime.value = ''
  } else {
    toast.error('Bác sĩ này không có lịch khám trong thời gian tới.')
  }
}

onMounted(async () => {
  if (
    staffStore.staff &&
    staffStore.staff.departments &&
    (staffStore.lastUpdated ?? 0) > Date.now() - 60000
  ) {
    departmentId.value = staffStore.staff.departments.id
    selectedDoctor.value = staffStore.staff.id
    currentStep.value = 3
  } else {
    staffStore.clearSelectedStaff()
    await departmentStore.fetchDepartments(0, 100)
    departments.value = departmentStore.departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      icon: dept?.icon || iconList[Math.floor(Math.random() * iconList.length)],
    }))
  }
})

watch(departmentId, async (newId) => {
  if (newId) {
    await staffStore.fetchAllStaffs(0, 100)
    staffs.value = staffStore.staffs.filter((staff) => staff.departments.id === newId)
    selectedDoctor.value = ''
  } else {
    staffs.value = []
  }
})

// Navigation
const nextStep = async () => {
  if (currentStep.value === 1 && !departmentId.value) {
    toast.error('Vui lòng chọn chuyên khoa')
    return
  }
  if (currentStep.value === 2 && !selectedDoctor.value) {
    toast.error('Vui lòng chọn bác sĩ')
    return
  }
  if (currentStep.value === 3 && (!selectedDate.value || !selectedTime.value)) {
    toast.error('Vui lòng chọn ngày và giờ khám')
    return
  }
  if (currentStep.value === 4 && selectedServiceIds.value.length === 0) {
    toast.error('Vui lòng chọn ít nhất một dịch vụ')
    return
  }
  if (currentStep.value === 4) {
    await fetchServices() // Fetch services before moving to service selection
  }
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 1) departmentId.value = ''
    if (currentStep.value <= 2) selectedDoctor.value = ''
    if (currentStep.value <= 3) {
      selectedDate.value = ''
      selectedTime.value = ''
    }
    if (currentStep.value <= 4) selectedServiceIds.value = []
  }
}

const resetForm = () => {
  patientForm.value = {
    date: '',
    time: '',
    staffId: '',
    doctorShiftId: '',
    reason: '',
    emailReceiveInfo: '',
    phoneReceiveInfo: '',
    dob: '',
    gender: '',
    name: '',
    servicesId: [],
  }
  selectedDate.value = ''
  selectedTime.value = ''
  selectedDoctor.value = ''
  departmentId.value = ''
  selectedServiceIds.value = []
  currentStep.value = 1
  staffStore.clearSelectedStaff()
}

// Submit booking
const submitBooking = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) {
    toast.error('Vui lòng điền đầy đủ thông tin hợp lệ')
    return
  }
  if (!departmentId.value) {
    toast.error('Vui lòng chọn chuyên khoa')
    currentStep.value = 1
    return
  }
  if (!selectedDoctor.value) {
    toast.error('Vui lòng chọn bác sĩ')
    currentStep.value = 2
    return
  }
  if (!selectedDate.value || !selectedTime.value) {
    toast.error('Vui lòng chọn ngày và giờ khám')
    currentStep.value = 3
    return
  }
  if (selectedServiceIds.value.length === 0) {
    toast.error('Vui lòng chọn ít nhất một dịch vụ')
    currentStep.value = 4
    return
  }
  try {
    patientForm.value.date = selectedDate.value
    patientForm.value.time = selectedTime.value
    patientForm.value.staffId = selectedDoctor.value
    patientForm.value.doctorShiftId =
      listDate.value.find((item) => item.date === selectedDate.value)?.id || ''
    patientForm.value.reason = patientForm.value.reason.trim()
    patientForm.value.emailReceiveInfo = patientForm.value.emailReceiveInfo || ''
    patientForm.value.serviceIds = selectedServiceIds.value
    await appointmentStore.createAppointment(patientForm.value)
    toast.success('Đặt lịch khám thành công!')
    resetForm()
    router.push({ name: 'ManageBookings' })
  } catch (error: any) {
    console.error('Error submitting booking:', error)
    toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi đặt lịch.')
  }
}
</script>

<style lang="scss" scoped>
.booking-page {
  padding: 2rem 0;
  background: #f7fafc;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 24px;
      left: 0;
      right: 0;
      height: 2px;
      background: #e2e8f0;
      z-index: 1;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      flex: 1;

      .step-number {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 0.5rem;
        transition: all 0.3s ease;
      }

      .step-label {
        font-size: 0.875rem;
        color: #718096;
        text-align: center;
      }

      &.active .step-number {
        background: #4fd1c5;
        border-color: #4fd1c5;
        color: white;
      }

      &.completed .step-number {
        background: #48bb78;
        border-color: #48bb78;
        color: white;
      }
    }
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: #718096;
  }

  .step-content {
    background: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .step-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #2d3748;
    }
  }

  .specialty-grid,
  .service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;

    .specialty-card,
    .service-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background: #4fd1c5;
        color: white;
      }

      .specialty-name,
      .service-name {
        text-align: center;
        margin-top: 1rem;
        font-weight: 500;
      }

      .service-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .service-price {
        color: #718096;
        font-size: 0.875rem;
      }
    }
  }

  .doctors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;

    .doctor-card {
      background: #f7fafc;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border: 2px solid #4fd1c5;
      }

      .doctor-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 50%;
        margin: 1rem;
      }

      .doctor-info {
        padding: 1rem;

        .doctor-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .doctor-specialty,
        .doctor-experience {
          color: #718096;
          margin-bottom: 0.5rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }
  }

  .no-data {
    text-align: center;
    color: #718096;
    padding: 1rem;
  }

  .datetime-selection {
    display: grid;
    gap: 1.5rem;

    .time-slots {
      .label {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: #4fd1c5;
        margin-bottom: 0.5rem;
      }

      .time-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;

        .time-slot {
          padding: 0.75rem;
          text-align: center;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover,
          &.active {
            background: #4fd1c5;
            color: white;
            border-color: #4fd1c5;
          }
        }
      }
    }
  }

  .patient-form {
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      .form-group {
        &.full-width {
          grid-column: 1 / -1;
        }

        .label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #4fd1c5;
          margin-bottom: 0.5rem;
        }
      }
    }
  }

  .step-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;

    .va-button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .progress-steps {
      .step {
        .step-label {
          font-size: 0.75rem;
        }
      }

      .patient-form {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .step-content {
      padding: 1rem;
    }

    .specialty-grid,
    .doctors-grid,
    .service-grid {
      grid-template-columns: 1fr;
    }

    .datetime-selection {
      .time-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      }
    }

    .step-navigation {
      flex-direction: column;
      gap: 1rem;

      .va-button {
        width: 100%;
      }
    }
  }
}
</style>
