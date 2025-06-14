<template>
  <div class="find-doctor-page">
    <h1 class="page-title">Tìm kiếm Bác Sĩ Chuyên Khoa</h1>

    <!-- Filters -->
    <va-card class="filters-card" outlined>
      <va-card-content>
        <div class="filters-row">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập tên bác sĩ..."
            clearable
            class="filter-input"
            aria-label="Tìm kiếm bác sĩ theo tên"
          >
            <template #prependInner>
              <va-icon name="search" color="#718096" />
            </template>
          </va-input>
          <va-select
            v-model="selectedSpecialty"
            label="Chọn chuyên khoa"
            :options="departments.map((dep) => ({ value: dep.id, text: dep.name }))"
            clearable
            class="filter-select"
            value-by="value"
            text-by="text"
            aria-label="Chọn chuyên khoa"
          />
          <div class="filter-actions">
            <va-button preset="secondary" @click="resetFilters" class="action-button">
              Xóa bộ lọc
            </va-button>
            <va-button preset="primary" @click="performSearch" class="action-button">
              Tìm kiếm
            </va-button>
          </div>
        </div>
      </va-card-content>
    </va-card>

    <!-- Doctors List -->
    <va-inner-loading :loading="staffStore.loading">
      <div v-if="doctors.length" class="doctors-grid">
        <div v-for="doctor in doctors" :key="doctor.id" class="doctor-card">
          <DoctorCard :doctor="doctor" @book-appointment="handleBookAppointment" />
        </div>
      </div>
      <div v-else class="no-results">
        <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
        <p>Không tìm thấy bác sĩ phù hợp. Vui lòng thử lại với bộ lọc khác.</p>
      </div>
      <div class="pagination-container">
        <va-pagination
          v-model="currentPage"
          :total="total"
          :pages="totalPages"
          :rows-per-page="pageSize"
          :rows-per-page-options="[5, 10, 20]"
          :visible-pages="5"
          @update:modelValue="onPageChange"
          aria-label="Phân trang danh sách bác sĩ"
        />
      </div>
    </va-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import DoctorCard from '@/components/client/DoctorCard.vue'
import { useStaffStore } from '@/stores/staff.store'
import type { Staff } from '@/interfaces/staff.interface'
import { useDepartmentStore } from '@/stores/department.store'
import type { Department } from '@/interfaces/department.interface'
import { useRouter } from 'vue-router'
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const router = useRouter()
/**
 * Pagination
 */
const currentPage = ref(staffStore.meta?.page || 1)
const pageSize = ref(staffStore.meta?.pageSize || 6)
const total = ref(staffStore.meta?.total || 0)
const totalPages = ref(staffStore.meta?.pages || 0)
watch(currentPage, async () => {
  await fetchInitData()
})

/**==========END=========== */
const doctors = ref<Staff[]>([])
const departments = ref<Department[]>([])

onMounted(async () => {
  staffStore.meta = {
    page: 1,
    pageSize: 6,
    total: 0,
    pages: 0,
  }
  await fetchInitData()
})
async function fetchInitData() {
  await staffStore.fetchAllStaffs(currentPage.value - 1, 6)
  await departmentStore.fetchDepartments(0, 1000)
  departments.value = departmentStore.departments
  doctors.value = staffStore.staffs
  total.value = staffStore.meta?.total || 0
  totalPages.value = staffStore.meta?.pages || 0
}

const searchQuery = ref('')
const selectedSpecialty = ref('')
const performSearch = async () => {
  const hasSearch = !!searchQuery.value
  const hasSpecialty = !!selectedSpecialty.value

  if (hasSearch || hasSpecialty) {
    await staffStore.fetchAllStaffs(
      0,
      6,
      hasSpecialty ? selectedSpecialty.value : undefined,
      hasSearch ? searchQuery.value : undefined,
    )
    doctors.value = staffStore.staffs
    total.value = staffStore.meta?.total || 0
    totalPages.value = staffStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
const resetFilters = () => {
  searchQuery.value = ''
  selectedSpecialty.value = ''
  currentPage.value = 1
  fetchInitData()
  toast.info('Đã xóa bộ lọc tìm kiếm')
}

const handleBookAppointment = (staff: Staff) => {
  staffStore.setSelectedStaff(staff)
  router.push({
    name: 'Bookings',
  })
}
</script>

<style lang="scss" scoped>
.find-doctor-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    text-align: center;
    margin-bottom: 2rem;
  }

  .filters-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .filters-row {
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 1rem;
    align-items: flex-end;

    .filter-input,
    .filter-select {
      min-width: 0;

      :deep(.va-input-wrapper__content),
      :deep(.va-select__content) {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: border-color 0.3s ease;

        &:hover {
          border-color: #4fd1c5;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;

      .action-button {
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;

        &.va-button--preset-primary {
          background: #4fd1c5;
          &:hover {
            background: #3bada1;
          }
        }

        &.va-button--preset-secondary {
          border: 1px solid #e2e8f0;
          &:hover {
            background: #f7fafc;
          }
        }
      }
    }
  }

  .doctors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;

    .doctor-card {
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .no-results {
    text-align: center;
    padding: 3rem 0;
    color: #718096;

    .va-icon {
      margin-bottom: 1rem;
    }

    p {
      font-size: 1rem;
      margin: 0;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;

    :deep(.va-pagination) {
      .va-button {
        border-radius: 6px;
        padding: 0.5rem;
        font-size: 0.9rem;

        &.va-button--active {
          background: #4fd1c5;
          color: #ffffff;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .filters-row {
      grid-template-columns: 1fr;
      gap: 1rem;

      .filter-actions {
        justify-content: flex-end;
      }
    }

    .doctors-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .filters-card {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }
  }
}
</style>
