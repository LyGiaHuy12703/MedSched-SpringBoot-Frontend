<template>
  <va-inner-loading
    :loading="
      appointmentStore.loading ||
      departmentStore.loading ||
      staffStore.loading ||
      scheduleStore.loading ||
      serviceStore.loading
    "
  >
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

        <!-- Step 1: Choose Specialty -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">Chọn chuyên khoa</h2>
          <div class="specialty-grid">
            <div
              v-for="department in departments"
              :key="department.id"
              class="specialty-card"
              :class="{ active: departmentId === department.id }"
              @click="departmentId = department.id"
            >
              <va-icon :name="department.icon || 'local_hospital'" size="large" />
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
              :class="{ active: selectedDoctorId === staff.id }"
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
                  {{ staff.departments?.name || 'Chuyên khoa' }} - {{ staff.position || 'Bác sĩ' }}
                </p>
                <p class="doctor-experience">{{ staff.experienceYear || 0 }} năm kinh nghiệm</p>
                <div class="doctor-rating">
                  <va-icon name="star" color="warning" />
                  <span>{{ staff.rating || 0 }}/5</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <va-icon name="person_off" size="large" />
            <p>Không có bác sĩ nào trong chuyên khoa này.</p>
          </div>
          <div class="pagination-container" v-if="totalPages > 1">
            <va-pagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
          </div>
        </div>

        <!-- Step 3: Choose Date & Time -->
        <div v-else-if="currentStep === 3" class="step-content">
          <h2 class="step-title">Chọn lịch khám</h2>
          <div class="datetime-selection">
            <div class="time-slots">
              <div class="label"><va-icon name="calendar_today" class="mr-2" /> Chọn ngày khám</div>
              <template v-if="availableDates.length">
                <div class="time-grid">
                  <button
                    v-for="date in availableDates"
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
                <va-icon name="sentiment_dissatisfied" size="large" />
                <p>Bác sĩ này không có lịch khám hợp lệ trong thời gian tới.</p>
              </div>
            </div>

            <div class="time-slots" v-if="selectedDate">
              <div class="label"><va-icon name="schedule" class="mr-2" /> Chọn giờ khám</div>
              <div v-if="isLoadingSlots" class="loading-slots">
                <va-progress-bar indeterminate />
                <p>Đang tìm các khung giờ trống...</p>
              </div>
              <div v-else-if="availableTimeSlots.length" class="time-grid">
                <button
                  v-for="timeSlot in availableTimeSlots"
                  :key="timeSlot.time"
                  class="time-slot"
                  :class="{ active: selectedTime === timeSlot.time }"
                  @click="selectedTime = timeSlot.time"
                >
                  {{ timeSlot.time.substring(0, 5) }}
                </button>
              </div>
              <div v-else class="no-data">
                <va-icon name="sentiment_dissatisfied" size="large" />
                <p>Không có giờ khám nào trống cho ngày này.</p>
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
                <span class="service-price">{{ formatPrice(service.price) }}</span>
              </div>
            </div>
          </div>
          <p v-if="!services.length" class="no-data">Không có dịch vụ nào khả dụng.</p>
        </div>

        <!-- Step 5: Patient Information -->
        <div v-else-if="currentStep === 5" class="step-content">
          <h2 class="step-title">Thông tin bệnh nhân</h2>
          <va-form ref="formRef" @submit.prevent="showConfirmationModal" class="patient-form">
            <div class="form-grid">
              <div class="form-group">
                <div class="label"><va-icon name="person" class="mr-1" /> Họ và tên</div>
                <va-input
                  v-model="patientForm.name"
                  :rules="[(v) => !!v.trim() || 'Vui lòng nhập họ và tên']"
                  placeholder="Nhập họ và tên"
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
                />
              </div>
              <div class="form-group">
                <div class="label"><va-icon name="phone" class="mr-1" /> Số điện thoại</div>
                <va-input
                  v-model="patientForm.phoneReceiveInfo"
                  :rules="[
                    (v) => !!v.trim() || 'Vui lòng nhập số điện thoại',
                    (v) => /^[0-9]{10}$/.test(v) || 'Số điện thoại phải có 10 chữ số',
                  ]"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div class="form-group">
                <div class="label"><va-icon name="schedule" class="mr-1" /> Ngày sinh</div>
                <va-input
                  type="date"
                  v-model="patientForm.dob"
                  :rules="[
                    (v) => !!v || 'Vui lòng chọn ngày sinh',
                    (v) => new Date(v) <= new Date() || 'Ngày sinh không được là tương lai',
                  ]"
                  placeholder="Chọn ngày sinh"
                />
              </div>
              <div class="form-group">
                <div class="label"><va-icon name="email" class="mr-1" /> Email</div>
                <va-input
                  v-model="patientForm.emailReceiveInfo"
                  :rules="[
                    (v) => !!v.trim() || 'Email là bắt buộc',
                    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ',
                  ]"
                  placeholder="Nhập email"
                />
              </div>
              <div class="form-group full-width">
                <div class="label"><va-icon name="notes" class="mr-1" /> Lý do khám bệnh</div>
                <va-input
                  v-model="patientForm.reason"
                  type="textarea"
                  :rules="[(v) => !!v.trim() || 'Vui lòng nhập lý do khám bệnh']"
                  placeholder="Mô tả triệu chứng"
                  :rows="4"
                />
              </div>
            </div>
          </va-form>
        </div>

        <!-- Confirmation Modal -->
        <!-- SỬ DỤNG KHỐI NÀY -->
        <ConfirmationModal
          v-model="showModal"
          :patient-form="patientForm"
          :selected-doctor-info="selectedDoctorInfo"
          :selected-date="selectedDate"
          :selected-time="selectedTime"
          :services="services.filter((s) => selectedServiceIds.includes(s.id))"
          :loading="appointmentStore.loading"
          @confirm="confirmBooking"
          @cancel="showModal = false"
        />

        <!-- Nav Buttons -->
        <div class="step-navigation">
          <va-button v-if="currentStep > 1" preset="secondary" @click="prevStep">
            Quay lại
          </va-button>
          <va-button v-if="currentStep < 5" preset="primary" @click="nextStep">
            Tiếp tục
          </va-button>
          <va-button v-else preset="primary" @click="showConfirmationModal">
            Xác nhận đặt lịch
          </va-button>
        </div>
      </div>
    </div>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useStaffStore } from '@/stores/staff.store'
import { useServiceStore } from '@/stores/service.store'
import { useAuthStore } from '@/stores/auth.store'
import type { StaffDoctorShift } from '@/interfaces/doctorShift.interfaces'
import type { Appointment, AppointmentRequest } from '@/interfaces/appointment.interfaces'
import type { Service } from '@/interfaces/service.interfaces'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

// --- SETUP STORES ---
const appointmentStore = useAppointmentStore()
const departmentStore = useDepartmentStore()
const staffStore = useStaffStore()
const scheduleStore = useScheduleStore()
const serviceStore = useServiceStore()
const authStore = useAuthStore()
const router = useRouter()

// --- STORE TO REFS ---
const { departments } = storeToRefs(departmentStore)
const { staffs, meta: staffMeta } = storeToRefs(staffStore)
const { services } = storeToRefs(serviceStore)
const { assignments: doctorAssignments } = storeToRefs(scheduleStore)

// --- STATE ---
const currentStep = ref(1)
const departmentId = ref('')
const selectedDoctorId = ref('') // Thống nhất chỉ dùng ID để lưu state
const selectedDate = ref('')
const selectedTime = ref('')
const selectedServiceIds = ref<string[]>([])
const bookedAppointments = ref<Appointment[]>([])
const isLoadingSlots = ref(false)
const showModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(6)
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)

const patientForm = ref<AppointmentRequest>({
  date: '',
  time: '',
  staffId: '',
  doctorShiftId: '',
  reason: '',
  servicesId: [],
  emailReceiveInfo: authStore.account?.user.email || '',
  phoneReceiveInfo: authStore.account?.user.phone || '',
  dob: authStore.account?.user.dob || '',
  gender: authStore.account?.user.gender || '',
  name: authStore.account?.user.name || '',
})

// --- COMPUTED PROPERTIES ---
const totalPages = computed(() => staffMeta.value?.pages || 0)
const selectedDoctorInfo = computed(
  () => staffs.value.find((s) => s.id === selectedDoctorId.value) || null,
)

const availableDates = computed(() => {
  const validAssignments = doctorAssignments.value.filter(
    (a) => a.status === 'APPROVED' || a.status === 'IN_PROGRESS',
  )
  const uniqueDates = [...new Set(validAssignments.map((a) => a.doctorShift.dayWork))]
  return uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
})

const availableTimeSlots = computed(() => {
  if (!selectedDate.value || isLoadingSlots.value) return []

  const busyTimeSet = new Set(
    bookedAppointments.value
      .filter((appt) => ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'].includes(appt.status))
      .map((appt) => appt.time),
  )

  const timeSlots = new Set<string>()
  const intervalMinutes = selectedDoctorInfo.value?.departments?.examinationTime || 30

  doctorAssignments.value
    .filter(
      (a) =>
        a.doctorShift.dayWork === selectedDate.value &&
        (a.status === 'APPROVED' || a.status === 'IN_PROGRESS'),
    )
    .forEach((assignment) => {
      const { startTime, endTime } = assignment.doctorShift
      const start = new Date(`1970-01-01T${startTime}`)
      const end = new Date(`1970-01-01T${endTime}`)
      const current = new Date(start)

      while (current < end) {
        const timeString = current.toTimeString().split(' ')[0]
        if (!busyTimeSet.has(timeString)) {
          timeSlots.add(timeString)
        }
        current.setMinutes(current.getMinutes() + intervalMinutes)
      }
    })

  return Array.from(timeSlots)
    .sort()
    .map((time) => ({ time }))
})

// --- WATCHERS ---
watch(departmentId, async (newId) => {
  if (newId) {
    currentPage.value = 1
    await staffStore.fetchAllStaffs(0, pageSize.value, newId, undefined, 'DOCTOR')
  }
})

watch(currentPage, async (newPage) => {
  if (departmentId.value) {
    await staffStore.fetchAllStaffs(
      newPage - 1,
      pageSize.value,
      departmentId.value,
      undefined,
      'DOCTOR',
    )
  }
})

watch(selectedDate, async (newDate) => {
  selectedTime.value = ''
  if (!newDate) {
    bookedAppointments.value = []
    return
  }

  isLoadingSlots.value = true
  try {
    const shiftIds = doctorAssignments.value
      .filter((a) => a.doctorShift.dayWork === newDate)
      .map((a) => a.doctorShift.id)

    if (shiftIds.length > 0) {
      await appointmentStore.fetchAppointmentsByShiftIds(shiftIds)
      bookedAppointments.value = appointmentStore.appointments
    } else {
      bookedAppointments.value = []
    }
  } catch (error) {
    toast.error('Lỗi khi tải các khung giờ đã đặt.')
  } finally {
    isLoadingSlots.value = false
  }
})

// --- METHODS ---
const selectDoctor = async (id: string) => {
  selectedDoctorId.value = id
  await scheduleStore.fetchAssignments({ page: 0, size: 1000, staffId: id })

  if (availableDates.value.length > 0) {
    selectedDate.value = availableDates.value[0]
  } else {
    toast.warn('Bác sĩ này không có lịch khám hợp lệ trong thời gian tới.')
    selectedDate.value = ''
  }
}

const nextStep = async () => {
  if (currentStep.value === 1 && !departmentId.value)
    return toast.error('Vui lòng chọn chuyên khoa')
  if (currentStep.value === 1) await serviceStore.fetchServices(0, 100, departmentId.value)
  if (currentStep.value === 2 && !selectedDoctorId.value) return toast.error('Vui lòng chọn bác sĩ')
  if (currentStep.value === 3 && (!selectedDate.value || !selectedTime.value))
    return toast.error('Vui lòng chọn ngày và giờ khám')
  if (currentStep.value === 4 && selectedServiceIds.value.length === 0)
    return toast.error('Vui lòng chọn ít nhất một dịch vụ')
  if (currentStep.value < 5) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
  switch (currentStep.value) {
    case 4:
      break
    case 3:
      selectedServiceIds.value = []
      break
    case 2:
      selectedDate.value = ''
      selectedTime.value = ''
      doctorAssignments.value = []
      break
    case 1:
      departmentId.value = ''
      selectedDoctorId.value = ''
      staffStore.clearSelectedStaff()
      break
  }
}

const showConfirmationModal = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) return toast.error('Vui lòng điền đầy đủ thông tin hợp lệ')
  if (
    !selectedDoctorId.value ||
    !selectedDate.value ||
    !selectedTime.value ||
    selectedServiceIds.value.length === 0
  ) {
    return toast.error('Vui lòng hoàn thành tất cả các bước trước đó.')
  }

  const assignment = doctorAssignments.value.find(
    (a) =>
      a.doctorShift.dayWork === selectedDate.value &&
      selectedTime.value >= a.doctorShift.startTime &&
      selectedTime.value < a.doctorShift.endTime,
  )
  if (!assignment) {
    toast.error('Ca khám đã chọn không hợp lệ hoặc không còn trống. Vui lòng chọn lại.')
    return (currentStep.value = 3)
  }

  patientForm.value = {
    ...patientForm.value,
    date: selectedDate.value,
    time: selectedTime.value,
    staffId: selectedDoctorId.value,
    doctorShiftId: assignment.doctorShift.id,
    servicesId: selectedServiceIds.value,
  }
  showModal.value = true
}

const confirmBooking = async () => {
  let loadingToastId: any = null
  try {
    loadingToastId = toast.loading('Đang xử lý yêu cầu...')
    const response = await appointmentStore.createAppointment(patientForm.value)
    showModal.value = false

    if (response.action === 'REDIRECT' && response.paymentUrl) {
      toast.update(loadingToastId, {
        render: 'Yêu cầu thành công! Đang chuyển đến trang thanh toán...',
        type: 'success',
        isLoading: false,
        autoClose: 1500,
      })
      setTimeout(() => {
        window.location.href = response.paymentUrl!
      }, 1500)
    } else {
      toast.update(loadingToastId, {
        render: response.message || 'Đặt lịch thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      router.push({
        name: 'PaymentResult',
        query: {
          status: 'success',
          message: response.message,
          appointmentId: response.appointmentId,
        },
      })
    }
  } catch (error: any) {
    showModal.value = false
    const errorMessage = error.message || 'Đã có lỗi xảy ra.'
    if (loadingToastId) {
      toast.update(loadingToastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
    } else {
      toast.error(errorMessage)
    }
  }
}

// --- HELPERS & LIFECYCLE ---
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
const genderOptions = [
  { value: 'MALE', text: 'Nam' },
  { value: 'FEMALE', text: 'Nữ' },
  { value: 'OTHER', text: 'Khác' },
]
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  })
const formatTime = (time: string) => time.substring(0, 5)
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND'
const toggleService = (serviceId: string) => {
  const index = selectedServiceIds.value.indexOf(serviceId)
  if (index > -1) selectedServiceIds.value.splice(index, 1)
  else selectedServiceIds.value.push(serviceId)
}

onMounted(async () => {
  const staff = staffStore.staff
  const lastUpdated = staffStore.lastUpdated ?? 0
  if (staff && staff.departments && lastUpdated > Date.now() - 60000) {
    departmentId.value = staff.departments.id
    staffs.value = [staff]
    await selectDoctor(staff.id)
    await serviceStore.fetchServices(0, 100, departmentId.value)
    currentStep.value = 3
  } else {
    staffStore.clearSelectedStaff()
    await departmentStore.fetchDepartments(0, 100)
    departments.value.forEach((dept, index) => {
      dept.icon = dept.icon || iconList[index % iconList.length]
    })
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (to.name !== 'PaymentResult') {
    staffStore.clearSelectedStaff()
  }
  next()
})
</script>

<style lang="scss" scoped>
/* Toàn bộ CSS của bạn giữ nguyên */
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
      z-index: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 0;
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
        background: #154ec1;
        border-color: #154ec1;
        color: white;
      }

      &.completed .step-number {
        background: #42f36e;
        border-color: #42f36e;
        color: white;
      }
    }
  }

  .loading-slots {
    padding: 2rem;
    text-align: center;
    color: #718096;
    p {
      margin-top: 1rem;
    }
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
        background: #154ec1;
        color: white;
        border-color: #154ec1;
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
        border-color: #154ec1;
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
            border-color: #154ec1;
            color: #2c7a7b;
          }

          &.active {
            background: #154ec1;
            color: white;
            border-color: #154ec1;
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
