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

      <!-- Step 3: Choose Date & Time (REFACTORED LOGIC) -->
      <div v-else-if="currentStep === 3" class="step-content">
        <h2 class="step-title">Chọn lịch khám</h2>
        <div class="datetime-selection">
          <div class="time-slots">
            <div class="label"><va-icon name="calendar_today" class="mr-2" /> Chọn ngày khám</div>
            <template v-if="listDate.length">
              <div class="time-grid">
                <button
                  v-for="date in listDate"
                  :key="date"
                  class="time-slot"
                  :class="{ active: selectedDate === date }"
                  @click="selectedDate = date"
                >
                  {{ formatDate(date) }}
                </button>
              </div>
            </template>
            <div v-else class="no-data">
              <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
              <p>Không có lịch khám cho bác sĩ này trong thời gian tới.</p>
            </div>
          </div>
          <div class="time-slots" v-if="selectedDate">
            <div class="label"><va-icon name="schedule" class="mr-2" /> Chọn giờ khám</div>
            <div class="time-grid" v-if="filteredTimes.length">
              <button
                v-for="time in filteredTimes"
                :key="time"
                class="time-slot"
                :class="{ active: selectedTime === time }"
                @click="selectedTime = time"
              >
                {{ time.substring(0, 5) }}
              </button>
            </div>
            <div v-else class="no-data">
              <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
              <p>Không có giờ khám nào cho ngày này hoặc các giờ đã được đặt hết.</p>
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
            <!-- Form fields remain the same -->
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
            <div class="form-group">
              <div class="label"><va-icon name="wc" class="mr-1" /> Giới tính</div>
              <va-select
                v-model="patientForm.gender"
                :options="genderOptions"
                :rules="[(v) => !!v || 'Vui lòng chọn giới tính']"
                placeholder="Chọn giới tính"
                value-by="value"
                text-by="text"
                required
              />
            </div>
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
import type { DoctorShift } from '@/interfaces/doctorShift.interfaces'
import type { Staff } from '@/interfaces/staff.interface'
import type { Service } from '@/interfaces/service.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useStaffStore } from '@/stores/staff.store'
import { useServiceStore } from '@/stores/service.store'
import { onMounted, ref, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth.store'

const appointmentStore = useAppointmentStore()
const departmentStore = useDepartmentStore()
const staffStore = useStaffStore()
const scheduleStore = useScheduleStore()
const serviceStore = useServiceStore()
const authStore = useAuthStore()

// State
const currentStep = ref<number>(1)
const departmentId = ref<string>('')
const selectedDoctor = ref('')
const selectedDate = ref<string>('')
const selectedTime = ref<string>('')
const selectedServiceIds = ref<string[]>([])

const departments = ref<Department[]>([])
const staffs = ref<Staff[]>([])
const schedules = ref<DoctorShift[]>([]) // Holds all shifts for the selected doctor
const listDate = ref<string[]>([]) // Holds unique, available dates
const services = ref<Service[]>([])

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

// Reset selectedTime when date changes
watch(selectedDate, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    selectedTime.value = ''
  }
})

// *** REFACTORED LOGIC ***
// Generates available time slots based on the doctor's actual shifts for the selected date.
const filteredTimes = computed(() => {
  if (!selectedDate.value) return []

  // 1. Filter all shifts that occur on the selected date
  const shiftsForDay = schedules.value.filter((shift) => shift.dayWork === selectedDate.value)

  if (!shiftsForDay.length) return []

  const allSlots: string[] = []
  const intervalMinutes = 60 // Assuming 1-hour slots for appointments

  // 2. Iterate over each shift for that day (e.g., morning shift, afternoon shift)
  shiftsForDay.forEach((shift) => {
    const { startTime, endTime } = shift
    // Use a dummy date to easily manipulate time
    const currentTime = new Date(`1970-01-01T${startTime}`)
    const endDateTime = new Date(`1970-01-01T${endTime}`)

    // 3. Generate time slots within the shift's start and end time
    while (currentTime < endDateTime) {
      const timeString = currentTime.toTimeString().split(' ')[0] // Format to "HH:mm:ss"
      allSlots.push(timeString)

      // Move to the next slot
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes)
    }
  })

  // 4. Return a sorted list of unique time slots
  return [...new Set(allSlots)].sort()
})

// Form data
const patientForm = ref<AppointmentRequest>({
  date: '',
  time: '',
  staffId: '',
  doctorShiftId: '',
  reason: '',
  emailReceiveInfo: authStore.account?.user.email || '',
  phoneReceiveInfo: authStore.account?.user.phone || '',
  dob: authStore.account?.user.dob || '',
  gender: authStore.account?.user.gender || '',
  name: authStore.account?.user.name || '',
  servicesId: [],
})

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

const emailRules = [
  (v: string) => !!v || 'Email là bắt buộc',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ',
]

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const toggleService = (serviceId: string) => {
  const index = selectedServiceIds.value.indexOf(serviceId)
  if (index > -1) {
    selectedServiceIds.value.splice(index, 1)
  } else {
    selectedServiceIds.value.push(serviceId)
  }
}

async function fetchInitData() {
  await staffStore.fetchAllStaffs(currentPage.value - 1, pageSize.value, departmentId.value)
  await departmentStore.fetchDepartments(0, 1000)
  departments.value = departmentStore.departments
  staffs.value = staffStore.staffs
  total.value = staffStore.meta?.total || 0
  totalPages.value = staffStore.meta?.pages || 0
}

async function fetchServices() {
  await serviceStore.fetchServices(0, 100, departmentId.value)
  services.value = serviceStore.services
}

async function onPageChange(page: number) {
  currentPage.value = page
  await fetchInitData()
}

async function selectDoctor(id: string) {
  selectedDoctor.value = id
  // 1. Fetch all shifts, including potentially cancelled ones
  await scheduleStore.fetchAllSchedule(0, 100, id, true)
  schedules.value = scheduleStore.schedules.filter((shift) => shift.status !== 'CANCELLED')

  // 3. Check if there are any valid shifts left
  if (schedules.value.length === 0) {
    toast.warn('Bác sĩ này không có lịch khám hợp lệ trong thời gian tới.')
    listDate.value = []
    return
  }

  // 4. Proceed with creating the list of available dates
  const uniqueDates = [...new Set(schedules.value.map((s) => s.dayWork))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )
  listDate.value = uniqueDates

  if (listDate.value.length > 0) {
    selectedDate.value = listDate.value[0]
    selectedTime.value = ''
  }
}

onMounted(async () => {
  // Logic remains the same, but simplified for clarity
  const staff = staffStore.staff
  const lastUpdated = staffStore.lastUpdated ?? 0
  if (staff && staff.departments && lastUpdated > Date.now() - 60000) {
    departmentId.value = staff.departments.id
    await selectDoctor(staff.id) // Re-use the selectDoctor logic
    selectedDoctor.value = staff.id
    currentStep.value = 3
  } else {
    staffStore.clearSelectedStaff()
    await departmentStore.fetchDepartments(0, 100)
    departments.value = departmentStore.departments.map((dept, index) => ({
      ...dept,
      icon: dept.icon || iconList[index % iconList.length],
    }))
  }
})

watch(departmentId, async (newId) => {
  if (newId) {
    await staffStore.fetchAllStaffs(0, 100, newId)
    staffs.value = staffStore.staffs
    selectedDoctor.value = ''
  } else {
    staffs.value = []
  }
})

const nextStep = async () => {
  if (currentStep.value === 1 && !departmentId.value) {
    toast.error('Vui lòng chọn chuyên khoa')
    return
  }
  if (currentStep.value === 1) {
    await fetchServices()
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
  if (currentStep.value < 5) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 1) {
      departmentId.value = ''
      selectedDoctor.value = ''
      schedules.value = []
      listDate.value = []
    }
    if (currentStep.value <= 2) {
      selectedDoctor.value = ''
      schedules.value = []
      listDate.value = []
    }
    if (currentStep.value <= 3) {
      selectedDate.value = ''
      selectedTime.value = ''
    }
    if (currentStep.value <= 4) {
      selectedServiceIds.value = []
    }
  }
}

const submitBooking = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) {
    toast.error('Vui lòng điền đầy đủ thông tin hợp lệ')
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

  // *** REFACTORED LOGIC to find the correct shift ID ***
  const selectedShift = schedules.value.find(
    (shift) =>
      shift.dayWork === selectedDate.value &&
      selectedTime.value >= shift.startTime &&
      selectedTime.value < shift.endTime,
  )

  if (!selectedShift) {
    toast.error('Ca khám đã chọn không hợp lệ hoặc không còn trống. Vui lòng chọn lại.')
    currentStep.value = 3
    return
  }

  try {
    toast.info('Đang tạo yêu cầu thanh toán, vui lòng chờ...')
    patientForm.value.date = selectedDate.value
    patientForm.value.time = selectedTime.value
    patientForm.value.staffId = selectedDoctor.value
    patientForm.value.doctorShiftId = selectedShift.id // Assign the correct shift ID
    patientForm.value.reason = patientForm.value.reason.trim()
    patientForm.value.servicesId = selectedServiceIds.value

    const paymentUrl = await appointmentStore.createAppointment(patientForm.value)
    if (paymentUrl) {
      window.location.href = paymentUrl
    } else {
      toast.error('Không nhận được URL thanh toán từ hệ thống.')
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi đặt lịch.')
  }
}
</script>

<style lang="scss" scoped>
/* CSS styles remain the same as the original file */
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
      border: 1px solid #e2e8f0;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background: #4fd1c5;
        color: white;
        border-color: #4fd1c5;
        .service-price {
          color: white;
        }
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
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;

    .doctor-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      border: 2px solid transparent;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #4fd1c5;
        box-shadow: 0 4px 8px rgba(79, 209, 197, 0.3);
      }

      .doctor-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 50%;
        margin: 1rem;
        border: 2px solid #e2e8f0;
      }

      .doctor-info {
        padding: 1rem 1rem 1rem 0;
        flex: 1;

        .doctor-name {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .doctor-specialty,
        .doctor-experience {
          color: #718096;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #2d3748;
        }
      }
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
    color: #718096;
    padding: 2rem;
    background-color: #f7fafc;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .datetime-selection {
    display: grid;
    gap: 2rem;

    .time-slots {
      .label {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }

      .time-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;

        .time-slot {
          padding: 0.75rem;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-weight: 500;
          color: #4a5568;

          &:hover {
            border-color: #4fd1c5;
            color: #2c7a7b;
          }

          &.active {
            background: #4fd1c5;
            color: white;
            border-color: #4fd1c5;
            transform: scale(1.05);
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
          color: #4a5568;
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
      font-weight: bold;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .progress-steps .step .step-label {
      font-size: 0.75rem;
    }

    .patient-form .form-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .step-content {
      padding: 1.5rem;
    }

    .specialty-grid,
    .doctors-grid,
    .service-grid,
    .datetime-selection .time-grid {
      grid-template-columns: 1fr;
    }

    .doctors-grid .doctor-card {
      flex-direction: column;
      text-align: center;
      .doctor-info {
        padding: 0 1rem 1rem 1rem;
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
