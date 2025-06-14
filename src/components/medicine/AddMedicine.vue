<template>
  <div class="add-medicine">
    <va-card stripe stripe-color="primary">
      <va-card-title class="header">
        <va-icon name="local_pharmacy" color="primary" class="mr-2"></va-icon>
        <h1 class="va-h4">Thêm dữ liệu thuốc</h1>
      </va-card-title>
      <va-card-content>
        <va-form ref="formRef" class="form-group" @submit.prevent="onSubmit">
          <!-- Basic Information -->
          <div class="section-title">Thông tin cơ bản</div>
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="tag" size="small" class="mr-1"></va-icon> Tên thuốc
              </div>
              <va-input
                v-model="medicineData.name"
                placeholder="Nhập tên thuốc"
                :rules="[(v) => !!v || 'Tên thuốc là bắt buộc']"
                required-mark
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="attach_money" size="small" class="mr-1"></va-icon> Giá
              </div>
              <va-input
                v-model.number="medicineData.price"
                type="number"
                placeholder="Nhập giá thuốc"
                :rules="[(v) => !!v || 'Giá là bắt buộc']"
                required-mark
              />
            </div>
          </div>

          <!-- Usage Details -->
          <div class="section-title mt-4">Chi tiết sử dụng</div>
          <div class="add-grid mb-3">
            <div class="add-item">
              <div class="label">
                <va-icon name="category" size="small" class="mr-1"></va-icon> Dạng bào chế
              </div>
              <va-input
                v-model="medicineData.formulation"
                placeholder="Nhập dạng bào chế"
                :rules="[(v) => !!v || 'Nhập dạng bào chế là bắt buộc']"
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="group_work" size="small" class="mr-1"></va-icon> Nhóm điều trị
              </div>
              <va-input
                v-model="medicineData.therapeuticGroup"
                placeholder="Nhập nhóm điều trị"
                :rules="[(v) => !!v || 'Nhập nhóm điều trị là bắt buộc']"
              />
            </div>
          </div>
          <div class="add-grid mb-3">
            <div class="add-item">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1"></va-icon> Mô tả
              </div>
              <va-textarea
                v-model="medicineData.description"
                placeholder="Nhập mô tả thuốc"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
                required-mark
              />
            </div>
          </div>
          <div class="add-item mb-3">
            <div class="label">
              <va-icon name="healing" size="small" class="mr-1"></va-icon> Liều lượng và cách dùng
            </div>
            <va-textarea
              v-model="medicineData.dosage"
              placeholder="Nhập liều lượng và cách dùng"
              :rules="[(v) => !!v || 'Nhập liều lượng và cách dùng là bắt buộc']"
            />
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="assignment" size="small" class="mr-1"></va-icon> Chỉ định
            </div>
            <va-textarea
              v-model="medicineData.indications"
              :rules="[(v) => !!v || 'Chỉ định là bắt buộc']"
              placeholder="Nhập chỉ định"
            />
          </div>

          <!-- Safety Information -->
          <div class="section-title mt-4">Thông tin an toàn</div>
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="block" size="small" class="mr-1"></va-icon> Chống chỉ định
              </div>
              <va-textarea
                v-model="medicineData.contraindications"
                placeholder="Nhập chống chỉ định"
                :rules="[(v) => !!v || 'Chống chí định là bắt buộc']"
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="warning" size="small" class="mr-1"></va-icon> Thận trọng
              </div>
              <va-textarea
                v-model="medicineData.cautions"
                placeholder="Nhập thận trọng"
                :rules="[(v) => !!v || 'Nhập thận thọng là bắt buộc']"
              />
            </div>
          </div>
          <div class="add-item mt-3">
            <div class="label">
              <va-icon name="sick" size="small" class="mr-1"></va-icon> Tác dụng phụ
            </div>
            <va-textarea
              v-model="medicineData.sideEffects"
              placeholder="Nhập tác dụng phụ"
              :rules="[(v) => !!v || 'Nhập tác dụng phụ là bắt buộc']"
            />
          </div>
          <!-- Additional Information -->
          <div class="section-title mt-4">Thông tin bổ sung</div>
          <div class="add-grid">
            <div class="add-item full-width">
              <div class="label">
                <va-icon name="note" size="small" class="mr-1"></va-icon> Ghi chú
              </div>
              <va-textarea v-model="medicineData.notes" placeholder="Nhập ghi chú" />
            </div>
            <div class="add-item full-width">
              <div class="label">
                <va-icon name="menu_book" size="small" class="mr-1"></va-icon> Tài liệu tham khảo
              </div>
              <va-textarea
                v-model="medicineData.referenceDocuments"
                placeholder="Nhập tài liệu tham khảo"
                :rules="[(v) => !!v || 'Nhập tài liệu tham khảo là bắt buộc']"
              />
            </div>
          </div>

          <VaCardActions class="actions">
            <VaButton @click="$emit('close-modal')" color="secondary">Hủy</VaButton>
            <VaButton @click="onSubmit" color="primary">Lưu dữ liệu thuốc</VaButton>
          </VaCardActions>
        </va-form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { CreateMedicineRequest } from '@/interfaces/medicine.interface'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  medicineData: CreateMedicineRequest
}>()
const medicineData = props.medicineData

const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const emit = defineEmits(['save-medicine', 'close-modal'])

const onSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('save-medicine', medicineData)
}
onMounted(() => {
  resetMedicineData()
})
const resetMedicineData = () => {
  medicineData.name = ''
  medicineData.price = 0
  medicineData.formulation = ''
  medicineData.therapeuticGroup = ''
  medicineData.description = ''
  medicineData.dosage = ''
  medicineData.indications = ''
  medicineData.contraindications = ''
  medicineData.cautions = ''
  medicineData.sideEffects = ''
  medicineData.notes = ''
  medicineData.referenceDocuments = ''
}
</script>

<style scoped lang="scss">
.add-medicine {
  padding: 1.5rem;

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--va-primary);
    margin-bottom: 1rem;
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;

    &.mt-3 {
      margin-top: 1.5rem;
    }
  }

  .add-item {
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

    &.full-width {
      grid-column: 1 / -1;
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
    }
  }

  .actions {
    display: flex;
    justify-content: end !important;
    text-align: right;
    padding: 1rem 0;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
}
</style>
