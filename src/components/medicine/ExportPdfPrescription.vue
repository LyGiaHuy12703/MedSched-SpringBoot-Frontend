```vue
<template>
  <div class="prescription-page">
    <header class="header">
      <div class="header-left">
        <p>SỞ Y TẾ ABC</p>
        <p><strong>Hệ thống dịch vụ y tế MedSched</strong></p>
        <p>SỐ TTBHYT: 0</p>
      </div>
      <div class="header-right">
        <p>Số hồ sơ: {{ appointment.user?.id?.substring(0, 12) || 'N/A' }}</p>
        <p>Phòng khám: Dịch Vụ</p>
        <p>Ngày khám: {{ formatDate(appointment.date) }}</p>
      </div>
    </header>

    <div class="title-container">
      <h1 class="main-title">ĐƠN THUỐC</h1>
      <div class="barcode-wrapper">
        <canvas id="barcode" class="barcode"></canvas>
        <p class="barcode-id">{{ medicalRecord.id || 'N/A' }}</p>
      </div>
    </div>

    <main class="content">
      <p class="patient-line"><strong>Đối tượng:</strong> Thu phí</p>
      <div class="patient-line">
        <span style="flex: 2"><strong>Họ tên:</strong> {{ appointment.name.toUpperCase() }}</span>
        <span style="flex: 1"
          ><strong>Phái:</strong> {{ appointment.gender === 'MALE' ? 'Nam' : 'Nữ' }}</span
        >
        <span style="flex: 1"><strong>Tuổi:</strong> {{ calculateAge(appointment.dob) }}</span>
      </div>
      <p class="patient-line">
        <strong>Địa chỉ:</strong> {{ appointment.user?.address || 'Chưa cung cấp' }}
      </p>
      <p class="patient-line diagnosis">
        <strong>Chẩn đoán:</strong> {{ medicalRecord.diagnosis || 'Chưa xác định' }}
      </p>

      <section class="medication-list">
        <div
          v-if="!medicalRecord.prescriptions || medicalRecord.prescriptions.length === 0"
          class="no-meds"
        >
          (Không có thuốc trong đơn)
        </div>
        <div v-for="(med, index) in medicalRecord.prescriptions" :key="index" class="med-item">
          <div class="med-info">
            <p class="med-name">
              {{ index + 1 }}. <strong>{{ med.medicationName?.split('(')[0] }}</strong>
              <span v-if="med.medicationName?.includes('(')"
                >({{ med.medicationName?.split('(')[1] }}</span
              >
            </p>
            <p class="med-dosage">{{ med.dosage || 'Theo chỉ dẫn' }}</p>
          </div>
          <div class="med-quantity">
            <span>{{ med.quantity || 'N/A' }}</span>
            <span>{{ med.unit || 'Viên' }}</span>
          </div>
        </div>
      </section>

      <div class="summary-line">
        <p><strong>Cộng khoản:</strong> {{ medicalRecord.prescriptions?.length || 0 }}</p>
      </div>
    </main>

    <footer class="footer">
      <div class="notes-section">
        <p><strong>Lời dặn:</strong></p>
        <p class="notes">
          {{ medicalRecord.notes || 'Tái khám theo lịch hẹn hoặc khi có dấu hiệu bất thường.' }}
        </p>
      </div>
      <div class="signature-section">
        <p class="date">{{ formatDate(medicalRecord.appointmentDate) }}</p>
        <p class="signature-title">Bác sĩ điều trị</p>
        <div class="signature-space"></div>
        <p class="doctor-name">{{ appointment.staff?.user?.name || 'N/A' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue'
import JsBarcode from 'jsbarcode'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import type { MedicalRecord } from '@/interfaces/medicalRecord.interfaces'

const props = defineProps<{
  appointment: Appointment
  medicalRecord: MedicalRecord
}>()

// Hàm format ngày tháng
const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Hàm tính tuổi
const calculateAge = (dob: string | Date | undefined): string => {
  if (!dob) return 'N/A'
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) return 'N/A'
  const today = new Date('2025-08-06') // Ngày hiện tại: 06/08/2025
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? `${age}` : '0'
}

// Tạo mã vạch
onMounted(() => {
  if (props.medicalRecord.id) {
    JsBarcode('#barcode', props.medicalRecord.id, {
      format: 'CODE128',
      width: 2,
      height: 40,
      displayValue: false,
      margin: 0,
      background: 'transparent',
      lineColor: '#000000',
    })
  }
})
</script>

<style scoped>
/* Font chữ chuẩn y tế */
@import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

.prescription-page {
  width: 200mm;
  padding: 10mm;
  box-sizing: border-box;
  font-family: 'Times New Roman', Times, serif;
  background-color: #fff;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

p {
  margin: 0;
  line-height: 1.5;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  font-size: 11pt;
  margin-bottom: 15px;
}

.header-left,
.header-right {
  flex: 1;
}

.header-left {
  text-align: left;
}

.header-right {
  text-align: right;
}

/* Tiêu đề và mã vạch */
.title-container {
  text-align: center;
  margin: 15px 0;
}

.main-title {
  font-size: 22pt;
  font-weight: bold;
  margin: 0;
  color: #1f2a44;
}

.barcode-wrapper {
  margin: 10px auto 0;
  width: 80%;
  max-width: 300px;
}

.barcode {
  width: 100%;
  height: 40px;
  display: block;
}

.barcode-id {
  font-size: 9pt;
  color: #4b5563;
  text-align: center;
  margin-top: 5px;
}

/* Nội dung */
.content {
  margin-bottom: 20px;
}

.patient-line {
  display: flex;
  font-size: 11pt;
  margin-top: 8px;
}

.patient-line strong {
  margin-right: 6px;
  color: #1f2a44;
}

.diagnosis {
  margin-top: 12px;
  margin-bottom: 15px;
  font-size: 12pt;
}

/* Danh sách thuốc */
.medication-list {
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

.med-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 11pt;
}

.med-info {
  flex-grow: 1;
}

.med-name {
  text-transform: uppercase;
  font-weight: bold;
}

.med-name span {
  text-transform: none;
  font-weight: normal;
}

.med-dosage {
  padding-left: 20px;
  color: #4b5563;
}

.med-quantity {
  width: 90px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.no-meds {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #6b7280;
  font-size: 11pt;
}

.summary-line {
  margin-top: 15px;
  font-size: 11pt;
  font-weight: bold;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.notes-section {
  flex: 1.5;
}

.notes-section .notes {
  margin-top: 5px;
  font-size: 11pt;
  color: #4b5563;
}

.signature-section {
  flex: 1;
  text-align: center;
}

.signature-title {
  font-weight: bold;
  font-size: 11pt;
}

.signature-space {
  height: 50px;
  margin: 10px 0;
}

.doctor-name {
  font-weight: bold;
  font-size: 11pt;
  color: #1f2a44;
}

.date {
  font-size: 11pt;
  color: #4b5563;
}

/* Đảm bảo in ấn */
@media print {
  .prescription-page {
    box-shadow: none;
    border: none;
    margin: 0;
    width: 210mm;
    height: 297mm;
    padding: 10mm;
  }
}
</style>
```
