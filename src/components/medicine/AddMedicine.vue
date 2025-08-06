```vue
<template>
  <div class="medication-add">
    <va-card stripe stripe-color="primary" class="medicine-card">
      <va-card-title class="header">
        <va-icon name="local_pharmacy" color="primary" class="mr-2" />
        <h1 class="va-h4">Thêm thuốc</h1>
      </va-card-title>
      <va-card-content class="content">
        <va-alert v-if="error" color="danger" class="mb-3">
          <va-icon name="warning" class="mr-2" />
          {{ error }}
        </va-alert>
        <va-progress-circle v-if="isLoading" indeterminate class="loading-circle" />
        <va-form v-else ref="formRef" class="form-group">
          <div class="section-title">Thông tin cơ bản</div>
          <div class="add-grid">
            <div class="add-item">
              <div class="label"><va-icon name="tag" size="small" class="mr-1" /> Tên thuốc</div>
              <va-input
                v-model="medicineData.name"
                placeholder="Nhập tên thuốc"
                :rules="[(v) => !!v || 'Tên thuốc là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label"><va-icon name="attach_money" size="small" class="mr-1" /> Giá</div>
              <va-input
                v-model.number="medicineData.price"
                type="number"
                placeholder="Nhập giá"
                :rules="[(v) => !!v || 'Giá là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
          </div>
          <div class="section-title mt-2">Chi tiết sử dụng</div>
          <div class="add-grid">
            <div class="add-item">
              <div class="label">
                <va-icon name="category" size="small" class="mr-1" /> Dạng bào chế
              </div>
              <va-input
                v-model="medicineData.formulation"
                placeholder="Nhập dạng bào chế"
                :rules="[(v) => !!v || 'Dạng bào chế là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
            <div class="add-item">
              <div class="label">
                <va-icon name="group_work" size="small" class="mr-1" /> Nhóm điều trị
              </div>
              <va-input
                v-model="medicineData.therapeuticGroup"
                placeholder="Nhập nhóm điều trị"
                :rules="[(v) => !!v || 'Nhóm điều trị là bắt buộc']"
                required-mark
                class="input-field"
                dense
              />
            </div>
          </div>
          <div class="add-grid">
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="description" size="small" class="mr-1" /> Mô tả
              </div>
              <va-textarea
                v-model="medicineData.description"
                placeholder="Nhập mô tả"
                :rules="[(v) => !!v || 'Mô tả là bắt buộc']"
                required-mark
                class="textarea-field"
                dense
              />
            </div>
          </div>
          <div class="section-title mt-2">Thông tin an toàn</div>
          <div class="add-grid">
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="healing" size="small" class="mr-1" /> Liều lượng
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearDosage"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="medicineData.dosage"
                :options="dosageOptions"
                placeholder="Chọn liều lượng"
                :rules="[
                  () =>
                    dosageOptions.length === 0 ||
                    (Array.isArray(medicineData.dosage) && medicineData.dosage.length > 0) ||
                    'Vui lòng chọn ít nhất một liều lượng',
                ]"
                :required-mark="dosageOptions.length > 0"
                multiple
                chips
                searchable
                value-by="value"
                text-by="text"
                class="select-field"
                dense
                no-options-text="Không có dữ liệu liều lượng"
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="assignment" size="small" class="mr-1" /> Chỉ định
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearIndications"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="medicineData.indications"
                :options="indicationOptions"
                placeholder="Chọn chỉ định"
                :rules="[
                  () =>
                    indicationOptions.length === 0 ||
                    (Array.isArray(medicineData.indications) &&
                      medicineData.indications.length > 0) ||
                    'Vui lòng chọn ít nhất một chỉ định',
                ]"
                :required-mark="indicationOptions.length > 0"
                multiple
                chips
                searchable
                value-by="value"
                text-by="text"
                class="select-field"
                dense
                no-options-text="Không có dữ liệu chỉ định"
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="block" size="small" class="mr-1" /> Chống chỉ định
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearContraindications"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="medicineData.contraindications"
                :options="contraindicationOptions"
                placeholder="Chọn chống chỉ định"
                :rules="[
                  () =>
                    contraindicationOptions.length === 0 ||
                    (Array.isArray(medicineData.contraindications) &&
                      medicineData.contraindications.length > 0) ||
                    'Vui lòng chọn ít nhất một chống chỉ định',
                ]"
                :required-mark="contraindicationOptions.length > 0"
                multiple
                chips
                searchable
                value-by="value"
                text-by="text"
                class="select-field"
                dense
                no-options-text="Không có dữ liệu chống chỉ định"
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="warning" size="small" class="mr-1" /> Thận trọng
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearCautions"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="medicineData.cautions"
                :options="cautionOptions"
                placeholder="Chọn thận trọng"
                :rules="[
                  () =>
                    cautionOptions.length === 0 ||
                    (Array.isArray(medicineData.cautions) && medicineData.cautions.length > 0) ||
                    'Vui lòng chọn ít nhất một thận trọng',
                ]"
                :required-mark="cautionOptions.length > 0"
                multiple
                chips
                searchable
                value-by="value"
                text-by="text"
                class="select-field"
                dense
                no-options-text="Không có dữ liệu thận trọng"
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="sick" size="small" class="mr-1" /> Tác dụng phụ
                <va-button
                  preset="plain"
                  class="ml-3"
                  size="small"
                  icon="clear"
                  @click="clearSideEffects"
                >
                  Xóa tất cả
                </va-button>
              </div>
              <va-select
                v-model="medicineData.sideEffects"
                :options="sideEffectOptions"
                placeholder="Chọn tác dụng phụ"
                :rules="[
                  () =>
                    sideEffectOptions.length === 0 ||
                    (Array.isArray(medicineData.sideEffects) &&
                      medicineData.sideEffects.length > 0) ||
                    'Vui lòng chọn ít nhất một tác dụng phụ',
                ]"
                :required-mark="sideEffectOptions.length > 0"
                multiple
                chips
                searchable
                value-by="value"
                text-by="text"
                class="select-field"
                dense
                no-options-text="Không có dữ liệu tác dụng phụ"
              />
            </div>
          </div>
          <div class="section-title mt-2">Thông tin bổ sung</div>
          <div class="add-grid">
            <div class="add-item permission-item">
              <div class="label"><va-icon name="note" size="small" class="mr-1" /> Ghi chú</div>
              <va-textarea
                v-model="medicineData.notes"
                placeholder="Nhập ghi chú"
                class="textarea-field"
                dense
              />
            </div>
            <div class="add-item permission-item">
              <div class="label">
                <va-icon name="menu_book" size="small" class="mr-1" /> Tài liệu tham khảo
              </div>
              <va-textarea
                v-model="medicineData.referenceDocuments"
                placeholder="Nhập tài liệu tham khảo"
                :rules="[(v) => !!v || 'Tài liệu tham khảo là bắt buộc']"
                required-mark
                class="textarea-field"
                dense
              />
            </div>
          </div>
        </va-form>
      </va-card-content>
      <va-card-actions class="actions">
        <va-button @click="$emit('close-modal')" color="secondary" class="action-button">
          Hủy
        </va-button>
        <va-button @click="onSubmit" color="primary" class="action-button">Lưu</va-button>
      </va-card-actions>
    </va-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { CreateMedicineRequest } from '@/interfaces/medicine.interface'
import { useMedicineStore } from '@/stores/medicine.store'

interface CreateMedicineRequest {
  name: string
  price: number
  formulation: string
  therapeuticGroup: string
  description: string
  dosage: string[]
  indications: string[]
  contraindications: string[]
  cautions: string[]
  sideEffects: string[]
  notes: string
  referenceDocuments: string
}

const props = defineProps<{
  medicineData: CreateMedicineRequest
}>()
const medicineData = props.medicineData
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const cautionOptions = ref<{ text: string; value: string }[]>([])
const indicationOptions = ref<{ text: string; value: string }[]>([])
const contraindicationOptions = ref<{ text: string; value: string }[]>([])
const dosageOptions = ref<{ text: string; value: string }[]>([])
const sideEffectOptions = ref<{ text: string; value: string }[]>([])

const emit = defineEmits(['save-medicine', 'close-modal'])
const medicineStore = useMedicineStore()

onMounted(async () => {
  resetMedicineData()
  await fetchOptions()
})

const fetchOptions = async () => {
  try {
    isLoading.value = true
    const responses = await Promise.all([
      medicineStore.fetchCautions(),
      medicineStore.fetchIndications(),
      medicineStore.fetchContraindications(),
      medicineStore.fetchDosage(),
      medicineStore.fetchSideEffect(),
    ])

    const [cautions, indications, contraindications, dosage, sideEffects] = responses

    // Ánh xạ dữ liệu với kiểm tra an toàn
    cautionOptions.value = Array.isArray(cautions?.data)
      ? cautions.data.map((item: string) => ({ text: item, value: item }))
      : []
    indicationOptions.value = Array.isArray(indications?.data)
      ? indications.data.map((item: string) => ({ text: item, value: item }))
      : []
    contraindicationOptions.value = Array.isArray(contraindications?.data)
      ? contraindications.data.map((item: string) => ({ text: item, value: item }))
      : []
    dosageOptions.value = Array.isArray(dosage?.data)
      ? dosage.data.map((item: string) => ({ text: item, value: item }))
      : []
    sideEffectOptions.value = Array.isArray(sideEffects?.data)
      ? sideEffects.data.map((item: string) => ({ text: item, value: item }))
      : []

    // Kiểm tra nếu bất kỳ danh sách nào rỗng
    if (
      !cautionOptions.value.length &&
      !indicationOptions.value.length &&
      !contraindicationOptions.value.length &&
      !dosageOptions.value.length &&
      !sideEffectOptions.value.length
    ) {
      error.value = 'Không có dữ liệu tùy chọn thuốc nào được tải. Vui lòng kiểm tra hệ thống.'
    } else if (
      !cautionOptions.value.length ||
      !indicationOptions.value.length ||
      !contraindicationOptions.value.length ||
      !dosageOptions.value.length ||
      !sideEffectOptions.value.length
    ) {
      error.value = 'Một số danh sách tùy chọn thuốc không có dữ liệu.'
    }
  } catch (err) {
    console.error('Error fetching medication options:', err)
    error.value = 'Không thể tải dữ liệu tùy chọn thuốc. Vui lòng thử lại.'
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (isValid) emit('save-medicine', medicineData)
}

const resetMedicineData = () => {
  medicineData.name = ''
  medicineData.price = 0
  medicineData.formulation = ''
  medicineData.therapeuticGroup = ''
  medicineData.description = ''
  medicineData.dosage = []
  medicineData.indications = []
  medicineData.contraindications = []
  medicineData.cautions = []
  medicineData.sideEffects = []
  medicineData.notes = ''
  medicineData.referenceDocuments = ''
}

const clearCautions = () => {
  medicineData.cautions = []
}

const clearIndications = () => {
  medicineData.indications = []
}

const clearContraindications = () => {
  medicineData.contraindications = []
}

const clearDosage = () => {
  medicineData.dosage = []
}

const clearSideEffects = () => {
  medicineData.sideEffects = []
}
</script>

<style scoped lang="scss">
.medication-add {
  padding: 1.5rem;

  .medicine-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    min-width: 600px;
    max-width: 900px;
    margin: 0 auto;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--va-background-border);
  }

  .section-title {
    font-weight: 600;
    color: var(--va-primary);
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    padding: 0.5rem 0.75rem;
    background: var(--va-background-secondary);
    border-radius: 4px;
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 0.75rem;

    &.mt-2 {
      margin-top: 1rem;
    }
  }

  .add-item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-radius: 6px;
    background: var(--va-background-secondary);
    border: 1px solid var(--va-background-border);
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--va-background-element);
    }

    &.permission-item {
      grid-column: span 2;
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
    }

    .input-field,
    .textarea-field,
    .select-field {
      border-radius: 4px;
      border: 1px solid var(--va-background-border);
      transition: border-color 0.2s ease;

      &:focus-within {
        border-color: var(--va-primary);
      }
    }

    .textarea-field {
      min-height: 80px;
    }
  }

  .loading-circle {
    display: block;
    margin: 2rem auto;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--va-background-border);

    .action-button {
      font-weight: 500;
      border-radius: 4px;
      font-size: 0.9rem;
      margin-left: 0.5rem;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  @media (max-width: 768px) {
    .add-grid {
      grid-template-columns: 1fr;
    }

    .add-item {
      padding: 0.75rem;

      &.permission-item {
        grid-column: span 1;
      }
    }

    .actions {
      flex-direction: column;

      .action-button {
        width: 100%;
        margin-bottom: 0.25rem;

        &:last-child {
          margin-bottom: 0;
        }

        &:first-child {
          margin-left: 0;
        }
      }
    }

    .medicine-card {
      min-width: 100%;
      max-width: 100%;
      margin: 0;
    }
  }
}
</style>
