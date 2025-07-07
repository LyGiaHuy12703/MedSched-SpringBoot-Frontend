<template>
  <va-inner-loading :loading="medicineStore.loading">
    <va-card>
      <va-card-content>
        <div class="justify-content-around my-3">
          <div class="my-3"><h1>Quản lý dữ liệu thuốc</h1></div>
          <div><va-button @click="onShowModalAdd">Thêm thuốc</va-button></div>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã thuốc, tên, mô tả..."
            clearable
            class="filter-input"
            aria-label="Tìm kiếm bác sĩ theo tên"
          >
            <template #prependInner>
              <va-icon name="search" color="#718096" />
            </template>
          </va-input>

          <div class="filter-actions">
            <va-button preset="secondary" @click="resetFilters" class="action-button">
              Xóa bộ lọc
            </va-button>
            <va-button preset="primary" @click="handleSearch" class="action-button">
              Tìm kiếm
            </va-button>
          </div>
        </div>
        <VaDataTable
          :items="medicineList"
          :columns="columns"
          hoverable
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="slotProps">
            med0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
          </template>
          <template #cell(actions)="slotProps">
            <VaButton
              preset="plain"
              icon="visibility"
              @click="onShowDetailModal(slotProps.rowData)"
            />
            <VaButton
              preset="plain"
              icon="edit"
              class="ml-3"
              @click="onShowEditModal(slotProps.rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              class="ml-3"
              @click="onShowDeleteModal(slotProps.rowData)"
            />
          </template>
        </VaDataTable>
        <div class="my-3 d-flex pagination-container">
          <VaPagination
            v-model="currentPage"
            :total="total"
            :pages="totalPages"
            :rows-per-page="pageSize"
            :rows-per-page-options="[5, 10, 20]"
            :visible-pages="5"
            class="mt-6"
            @update:modelValue="onPageChange"
          />
        </div>

        <va-modal v-model="isShowAddModal" hide-default-actions @close="onCloseModalAdd">
          <AddMedicine
            :medicineData="medicineData"
            @save-medicine="onSaveMedicine"
            @close-modal="onCloseModalAdd"
          />
        </va-modal>
        <va-modal v-model="isShowDetailModal" hide-default-actions @close="onCloseModalDetail">
          <DetailMedicine :medicine-data="selectedMedicine" @close-modal="onCloseModalDetail" />
        </va-modal>
        <va-modal v-model="showModalEdit" hide-default-actions @close="onCloseModalEdit">
          <EditMedicine
            :medicine-data="medicineDataEdit"
            @edit-medicine="onEditMedicine"
            @close="onCloseModalEdit"
          />
        </va-modal>
        <va-modal v-model="showModalDelete" hide-default-actions>
          <DeleteConfirm
            title="Cảnh báo xóa thuốc"
            message="Bạn có muốn xóa dữ liệu thuốc không?"
            @confirm="onDeleteMedicine"
            @close-confirm="onCloseModalDelete"
          />
        </va-modal>
        <div class="d-flex">
          <VaAlert class="!mt-6" color="info" outline>
            Number of filtered items:
            <VaChip>{{ filteredCount }}</VaChip>
          </VaAlert>
          <VaAlert class="!mt-6" color="info" outline>
            Total items:
            <VaChip>{{ total }}</VaChip>
          </VaAlert>
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>
<script setup lang="ts">
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import AddMedicine from '@/components/medicine/AddMedicine.vue'
import DetailMedicine from '@/components/medicine/DetailMedicine.vue'
import EditMedicine from '@/components/medicine/EditMedicine.vue'
import { type CreateMedicineRequest, type Medicine } from '@/interfaces/medicine.interface'
import { useMedicineStore } from '@/stores/medicine.store'
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

const medicineStore = useMedicineStore()
const medicineList = ref(medicineStore.medicines || [])
const columns = [
  { label: 'STT', value: 'id', key: 'id' },
  { label: 'Tên thuốc', value: 'name', key: 'name' },
  { label: 'Giá', value: 'price', key: 'price' },
  { label: 'Mô tả', value: 'description', key: 'description' },
  { label: 'Hành động', value: 'actions', key: 'actions', sortable: false },
]
const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchInitData()
  toast.info('Đã xóa bộ lọc tìm kiếm')
}
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch()
}
const performSearch = async () => {
  const hasSearch = !!searchQuery.value

  if (hasSearch) {
    await medicineStore.fetchMedicines(
      currentPage.value - 1,
      5,
      hasSearch ? searchQuery.value : undefined,
    )
    medicineList.value = medicineStore.medicines
    total.value = medicineStore.meta?.total || 0
    totalPages.value = medicineStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
/**
 * Pagination
 */
const currentPage = ref(medicineStore.meta?.page || 1)
const pageSize = ref(medicineStore.meta?.pageSize || 5)
const total = ref(medicineStore.meta?.total || 0)
const totalPages = ref(medicineStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})

/**==========END=========== */
/**
 * FILTER
 */
const filteredCount = ref(medicineList.value.length)

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
/**==========END=========== */

onMounted(async () => {
  await fetchInitData()
})

const fetchInitData = async () => {
  await medicineStore.fetchMedicines(currentPage.value - 1, pageSize.value)
  medicineList.value = medicineStore.medicines
  if (medicineStore.meta) {
    currentPage.value = medicineStore.meta.page
    pageSize.value = medicineStore.meta.pageSize
    total.value = medicineStore.meta.total
    totalPages.value = medicineStore.meta.pages
  }
}

/**
 * ADD EVENT HANDLERS
 */
const medicineData = ref<CreateMedicineRequest>({
  name: '',
  description: '',
  dosage: '',
  sideEffects: '',
  price: 0,
})
const isShowAddModal = ref(false)
const onShowModalAdd = () => {
  isShowAddModal.value = !isShowAddModal.value
}
const onCloseModalAdd = () => {
  isShowAddModal.value = false
}
const onSaveMedicine = async (data: CreateMedicineRequest) => {
  try {
    await medicineStore.addMedicine(data)
    toast.success('Thêm thuốc thành công!')
    isShowAddModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Thêm thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============ */
/**
 * DETAIL EVENT HANDLERS
 */
const isShowDetailModal = ref(false)
const selectedMedicine = ref<Medicine | null>(null)
const onShowDetailModal = (item: Medicine) => {
  selectedMedicine.value = item
  isShowDetailModal.value = true
}
const onCloseModalDetail = () => {
  isShowDetailModal.value = false
  selectedMedicine.value = null
}
/**===========END============= */
/**
 * EDIT EVENT HANDLERS
 */
const medicineDataEdit = ref<Medicine | null>(null)
const showModalEdit = ref(false)
const onShowEditModal = (item: Medicine) => {
  medicineDataEdit.value = item
  showModalEdit.value = true
}
const onCloseModalEdit = () => {
  showModalEdit.value = false
  selectedMedicine.value = null
}
const onEditMedicine = async (data: Medicine) => {
  if (!medicineDataEdit.value) return
  try {
    await medicineStore.updateMedicine(data.id, data)
    toast.success('Cập nhật thuốc thành công!')
    showModalEdit.value = false
    medicineDataEdit.value = null
    await fetchInitData()
  } catch (error) {
    toast.error(`Cập nhật thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============= */
/**
 * DELETE EVENT HANDLERS
 */
const showModalDelete = ref(false)
const onShowDeleteModal = (item: Medicine) => {
  selectedMedicine.value = item
  showModalDelete.value = true
}
const onCloseModalDelete = () => {
  showModalDelete.value = false
  selectedMedicine.value = null
}
const onDeleteMedicine = async () => {
  if (!selectedMedicine.value) return
  try {
    await medicineStore.deleteMedicine(selectedMedicine.value.id)
    toast.success('Xóa thuốc thành công!')
    showModalDelete.value = false
    selectedMedicine.value = null
    await fetchInitData()
  } catch (error) {
    toast.error(`Xóa thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============= */
</script>
<style scoped lang="scss">
.pagination-container {
  justify-content: end;
  margin-top: 40px;
}
:deep(.va-data-table__table-thead) {
  background-color: #ecf0f1 !important; /* đổi màu header */
}
</style>
