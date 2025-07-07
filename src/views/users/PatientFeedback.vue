<template>
  <div class="feedback-forum-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Diễn đàn Feedback Bệnh nhân</h1>
      <p class="page-subtitle">Quản lý và theo dõi đánh giá của bệnh nhân về bác sĩ</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <va-card class="stat-card">
        <va-card-content>
          <div class="stat-content">
            <div class="stat-icon total">
              <va-icon name="forum" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ feedbackStats.total }}</div>
              <div class="stat-label">Tổng feedback</div>
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="stat-card">
        <va-card-content>
          <div class="stat-content">
            <div class="stat-icon positive">
              <va-icon name="thumb_up" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ feedbackStats.positive }}</div>
              <div class="stat-label">Đánh giá tích cực</div>
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="stat-card">
        <va-card-content>
          <div class="stat-content">
            <div class="stat-icon negative">
              <va-icon name="thumb_down" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ feedbackStats.negative }}</div>
              <div class="stat-label">Đánh giá tiêu cực</div>
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="stat-card">
        <va-card-content>
          <div class="stat-content">
            <div class="stat-icon average">
              <va-icon name="star" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ feedbackStats.averageRating.toFixed(1) }}</div>
              <div class="stat-label">Đánh giá trung bình</div>
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- Filters and Actions -->
    <va-card class="filters-card">
      <va-card-content>
        <div class="filters-container">
          <div class="filter-row">
            <va-input
              v-model="searchQuery"
              placeholder="Tìm kiếm theo bệnh nhân, bác sĩ, nội dung..."
              class="search-input"
            >
              <template #prepend>
                <va-icon name="search" />
              </template>
            </va-input>

            <va-select
              v-model="filterRating"
              placeholder="Lọc theo đánh giá"
              :options="ratingOptions"
              text-by="text"
              value-by="value"
              clearable
              class="filter-select"
            />

            <va-select
              v-model="filterStatus"
              placeholder="Trạng thái"
              :options="statusOptions"
              text-by="text"
              value-by="value"
              clearable
              class="filter-select"
            />
          </div>

          <div class="filter-row">
            <va-select
              v-model="filterDoctor"
              placeholder="Lọc theo bác sĩ"
              :options="doctorOptions"
              text-by="text"
              value-by="value"
              clearable
              class="filter-select"
            />

            <va-input
              v-model="filterDate"
              type="date"
              placeholder="Ngày đăng"
              class="filter-select"
            />

            <va-button
              preset="primary"
              icon="add"
              @click="openCreateModal"
            >
              Thêm feedback mới
            </va-button>
          </div>
        </div>
      </va-card-content>
    </va-card>

    <!-- Feedback List -->
    <div class="feedback-list">
      <div
        v-for="feedback in paginatedFeedbacks"
        :key="feedback.id"
        class="feedback-card"
      >
        <va-card>
          <va-card-content>
            <div class="feedback-header">
              <div class="patient-info">
                <img
                  :src="feedback.patient.avatar"
                  :alt="feedback.patient.name"
                  class="patient-avatar"
                >
                <div class="patient-details">
                  <h3 class="patient-name">{{ feedback.patient.name }}</h3>
                  <p class="patient-meta">{{ formatDate(feedback.createdAt) }}</p>
                </div>
              </div>

              <div class="feedback-meta">
                <div class="rating-display">
                  <div class="stars">
                    <va-icon
                      v-for="star in 5"
                      :key="star"
                      name="star"
                      :color="star <= feedback.rating ? 'warning' : 'gray'"
                      size="small"
                    />
                  </div>
                  <span class="rating-text">{{ feedback.rating }}/5</span>
                </div>

                <va-badge
                  :color="getStatusColor(feedback.status)"
                  :text="getStatusText(feedback.status)"
                />
              </div>
            </div>

            <div class="feedback-content">
              <div class="doctor-info">
                <div class="doctor-tag">
                  <va-icon name="medical_services" />
                  <span>{{ feedback.doctor.name }} - {{ feedback.doctor.department }}</span>
                </div>
              </div>

              <div class="feedback-text">
                <h4 class="feedback-title">{{ feedback.title }}</h4>
                <p class="feedback-description">{{ feedback.content }}</p>
              </div>

              <div v-if="feedback.tags.length > 0" class="feedback-tags">
                <va-chip
                  v-for="tag in feedback.tags"
                  :key="tag"
                  size="small"
                  class="tag-chip"
                >
                  {{ tag }}
                </va-chip>
              </div>
            </div>

            <div class="feedback-actions">
              <div class="engagement-stats">
                <div class="stat-item">
                  <va-icon name="thumb_up" size="small" />
                  <span>{{ feedback.likes }}</span>
                </div>
                <div class="stat-item">
                  <va-icon name="comment" size="small" />
                  <span>{{ feedback.comments }}</span>
                </div>
                <div class="stat-item">
                  <va-icon name="visibility" size="small" />
                  <span>{{ feedback.views }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <va-button
                  preset="secondary"
                  icon="visibility"
                  size="small"
                  @click="viewFeedback(feedback)"
                >
                  Xem chi tiết
                </va-button>
                <va-button
                  preset="info"
                  icon="edit"
                  size="small"
                  @click="editFeedback(feedback)"
                >
                  Chỉnh sửa
                </va-button>
                <va-button
                  preset="danger"
                  icon="delete"
                  size="small"
                  @click="deleteFeedback(feedback.id)"
                >
                  Xóa
                </va-button>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedFeedbacks.length === 0" class="empty-state">
        <va-icon name="forum" size="large" />
        <h3>Không có feedback nào</h3>
        <p>Chưa có feedback nào phù hợp với bộ lọc hiện tại</p>
        <va-button preset="primary" @click="openCreateModal">
          Thêm feedback đầu tiên
        </va-button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <va-pagination
        v-model="currentPage"
        :pages="totalPages"
        :visible-pages="5"
      />
      <div class="pagination-info">
        Hiển thị {{ startRecord }} - {{ endRecord }} của {{ filteredFeedbacks.length }} feedback
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <va-modal
      v-model="isModalOpen"
      size="large"
      @close="closeModal"
    >
      <template #header>
        <h2>{{ isEditing ? 'Chỉnh sửa feedback' : 'Thêm feedback mới' }}</h2>
      </template>

      <div class="feedback-form">
        <div class="form-row">
          <div class="form-group">
            <va-select
              v-model="feedbackForm.patientId"
              label="Bệnh nhân"
              :options="patientOptions"
              text-by="text"
              value-by="value"
              required
            />
          </div>

          <div class="form-group">
            <va-select
              v-model="feedbackForm.doctorId"
              label="Bác sĩ"
              :options="doctorOptions"
              text-by="text"
              value-by="value"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <va-input
            v-model="feedbackForm.title"
            label="Tiêu đề"
            placeholder="Nhập tiêu đề feedback..."
            required
          />
        </div>

        <div class="form-group">
          <va-input
            v-model="feedbackForm.content"
            type="textarea"
            label="Nội dung feedback"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows="4"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Đánh giá</label>
            <div class="rating-input">
              <va-icon
                v-for="star in 5"
                :key="star"
                name="star"
                :color="star <= feedbackForm.rating ? 'warning' : 'gray'"
                size="large"
                class="rating-star"
                @click="feedbackForm.rating = star"
              />
              <span class="rating-value">{{ feedbackForm.rating }}/5</span>
            </div>
          </div>

          <div class="form-group">
            <va-select
              v-model="feedbackForm.status"
              label="Trạng thái"
              :options="statusOptions"
              text-by="text"
              value-by="value"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <va-input
            v-model="tagsInput"
            label="Tags (phân cách bằng dấu phẩy)"
            placeholder="vd: chuyên nghiệp, tận tâm, kinh nghiệm"
            @keyup.enter="addTag"
          />
          <div v-if="feedbackForm.tags.length > 0" class="tags-preview">
            <va-chip
              v-for="(tag, index) in feedbackForm.tags"
              :key="index"
              closeable
              @close="removeTag(index)"
              class="tag-chip"
            >
              {{ tag }}
            </va-chip>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <va-button preset="secondary" @click="closeModal">
            Hủy
          </va-button>
          <va-button
            preset="primary"
            @click="saveFeedback"
            :loading="isSubmitting"
          >
            {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- View Detail Modal -->
    <va-modal
      v-model="isViewModalOpen"
      size="large"
      @close="closeViewModal"
    >
      <template #header>
        <h2>Chi tiết feedback</h2>
      </template>

      <div v-if="selectedFeedback" class="feedback-detail">
        <div class="detail-header">
          <div class="patient-section">
            <img
              :src="selectedFeedback.patient.avatar"
              :alt="selectedFeedback.patient.name"
              class="detail-avatar"
            >
            <div class="patient-info">
              <h3>{{ selectedFeedback.patient.name }}</h3>
              <p>{{ selectedFeedback.patient.email }}</p>
              <p>{{ formatDate(selectedFeedback.createdAt) }}</p>
            </div>
          </div>

          <div class="rating-section">
            <div class="stars">
              <va-icon
                v-for="star in 5"
                :key="star"
                name="star"
                :color="star <= selectedFeedback.rating ? 'warning' : 'gray'"
              />
            </div>
            <span class="rating-text">{{ selectedFeedback.rating }}/5</span>
          </div>
        </div>

        <div class="detail-content">
          <div class="doctor-info">
            <h4>Bác sĩ được đánh giá</h4>
            <div class="doctor-card">
              <img
                :src="selectedFeedback.doctor.avatar"
                :alt="selectedFeedback.doctor.name"
                class="doctor-avatar"
              >
              <div class="doctor-details">
                <h5>{{ selectedFeedback.doctor.name }}</h5>
                <p>{{ selectedFeedback.doctor.department }}</p>
                <p>{{ selectedFeedback.doctor.specialization }}</p>
              </div>
            </div>
          </div>

          <div class="feedback-content">
            <h4>{{ selectedFeedback.title }}</h4>
            <p>{{ selectedFeedback.content }}</p>
          </div>

          <div v-if="selectedFeedback.tags.length > 0" class="tags-section">
            <h4>Tags</h4>
            <div class="tags-list">
              <va-chip
                v-for="tag in selectedFeedback.tags"
                :key="tag"
                class="tag-chip"
              >
                {{ tag }}
              </va-chip>
            </div>
          </div>

          <div class="engagement-section">
            <h4>Thống kê tương tác</h4>
            <div class="engagement-grid">
              <div class="engagement-item">
                <va-icon name="thumb_up" />
                <span>{{ selectedFeedback.likes }} lượt thích</span>
              </div>
              <div class="engagement-item">
                <va-icon name="comment" />
                <span>{{ selectedFeedback.comments }} bình luận</span>
              </div>
              <div class="engagement-item">
                <va-icon name="visibility" />
                <span>{{ selectedFeedback.views }} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <va-button preset="secondary" @click="closeViewModal">
          Đóng
        </va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Types
interface Patient {
  id: string
  name: string
  email: string
  avatar: string
}

interface Doctor {
  id: string
  name: string
  department: string
  specialization: string
  avatar: string
}

interface Feedback {
  id: string
  patient: Patient
  doctor: Doctor
  title: string
  content: string
  rating: number
  status: 'published' | 'pending' | 'hidden'
  tags: string[]
  likes: number
  comments: number
  views: number
  createdAt: string
  updatedAt: string
}

// Sample data
const feedbacks = ref<Feedback[]>([
  {
    id: 'FB001',
    patient: {
      id: 'P001',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    doctor: {
      id: 'D001',
      name: 'BS. Trần Thị Hoa',
      department: 'Khoa Tim mạch',
      specialization: 'Bác sĩ chuyên khoa Tim mạch',
      avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg'
    },
    title: 'Bác sĩ rất tận tâm và chuyên nghiệp',
    content: 'Tôi rất hài lòng với dịch vụ khám bệnh. Bác sĩ Hoa rất tận tâm, giải thích rõ ràng về tình trạng bệnh và hướng điều trị. Phòng khám sạch sẽ, nhân viên thân thiện.',
    rating: 5,
    status: 'published',
    tags: ['tận tâm', 'chuyên nghiệp', 'giải thích rõ ràng'],
    likes: 24,
    comments: 8,
    views: 156,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'FB002',
    patient: {
      id: 'P002',
      name: 'Lê Thị Bình',
      email: 'lethibinh@email.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
    },
    doctor: {
      id: 'D002',
      name: 'BS. Nguyễn Văn Minh',
      department: 'Khoa Nhi',
      specialization: 'Bác sĩ chuyên khoa Nhi',
      avatar: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg'
    },
    title: 'Khám cho con rất chu đáo',
    content: 'Bác sĩ Minh khám cho con tôi rất kỹ lưỡng. Con tôi ban đầu sợ nhưng bác sĩ rất kiên nhẫn, tạo không khí thoải mái. Kết quả điều trị rất tốt.',
    rating: 5,
    status: 'published',
    tags: ['kiên nhẫn', 'chu đáo', 'tốt với trẻ em'],
    likes: 18,
    comments: 5,
    views: 89,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 'FB003',
    patient: {
      id: 'P003',
      name: 'Phạm Văn Cường',
      email: 'phamvancuong@email.com',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    },
    doctor: {
      id: 'D003',
      name: 'BS. Lê Thị Lan',
      department: 'Khoa Da liễu',
      specialization: 'Bác sĩ chuyên khoa Da liễu',
      avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg'
    },
    title: 'Điều trị hiệu quả, thái độ tốt',
    content: 'Tôi đã điều trị bệnh da liễu với bác sĩ Lan trong 2 tháng. Bác sĩ rất nhiệt tình tư vấn, theo dõi sát sao quá trình điều trị. Hiện tại tình trạng da đã cải thiện rõ rệt.',
    rating: 4,
    status: 'published',
    tags: ['hiệu quả', 'theo dõi sát sao', 'nhiệt tình'],
    likes: 12,
    comments: 3,
    views: 67,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 'FB004',
    patient: {
      id: 'P004',
      name: 'Vũ Thị Dung',
      email: 'vuthidung@email.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    doctor: {
      id: 'D004',
      name: 'BS. Phạm Văn Hùng',
      department: 'Khoa Thần kinh',
      specialization: 'Bác sĩ chuyên khoa Thần kinh',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg'
    },
    title: 'Thời gian chờ hơi lâu nhưng bác sĩ tốt',
    content: 'Phải chờ khá lâu mới được khám nhưng bác sĩ Hùng khám rất kỹ. Chẩn đoán chính xác và đưa ra phương án điều trị phù hợp. Hy vọng bệnh viện cải thiện thời gian chờ.',
    rating: 3,
    status: 'published',
    tags: ['chẩn đoán chính xác', 'khám kỹ', 'chờ lâu'],
    likes: 8,
    comments: 2,
    views: 45,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  }
])

// State
const searchQuery = ref('')
const filterRating = ref('')
const filterStatus = ref('')
const filterDoctor = ref('')
const filterDate = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Modal states
const isModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const selectedFeedback = ref<Feedback | null>(null)

// Form state
const feedbackForm = ref({
  id: '',
  patientId: '',
  doctorId: '',
  title: '',
  content: '',
  rating: 5,
  status: 'published',
  tags: [] as string[]
})

const tagsInput = ref('')

// Options
const ratingOptions = [
  { value: '5', text: '5 sao' },
  { value: '4', text: '4 sao' },
  { value: '3', text: '3 sao' },
  { value: '2', text: '2 sao' },
  { value: '1', text: '1 sao' }
]

const statusOptions = [
  { value: 'published', text: 'Đã xuất bản' },
  { value: 'pending', text: 'Chờ duyệt' },
  { value: 'hidden', text: 'Đã ẩn' }
]

// Sample options (in real app, these would come from API)
const doctorOptions = ref([
  { value: 'D001', text: 'BS. Trần Thị Hoa - Khoa Tim mạch' },
  { value: 'D002', text: 'BS. Nguyễn Văn Minh - Khoa Nhi' },
  { value: 'D003', text: 'BS. Lê Thị Lan - Khoa Da liễu' },
  { value: 'D004', text: 'BS. Phạm Văn Hùng - Khoa Thần kinh' }
])

const patientOptions = ref([
  { value: 'P001', text: 'Nguyễn Văn An' },
  { value: 'P002', text: 'Lê Thị Bình' },
  { value: 'P003', text: 'Phạm Văn Cường' },
  { value: 'P004', text: 'Vũ Thị Dung' }
])

// Computed
const filteredFeedbacks = computed(() => {
  let result = [...feedbacks.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(feedback =>
      feedback.patient.name.toLowerCase().includes(query) ||
      feedback.doctor.name.toLowerCase().includes(query) ||
      feedback.title.toLowerCase().includes(query) ||
      feedback.content.toLowerCase().includes(query) ||
      feedback.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Rating filter
  if (filterRating.value) {
    result = result.filter(feedback => feedback.rating.toString() === filterRating.value)
  }

  // Status filter
  if (filterStatus.value) {
    result = result.filter(feedback => feedback.status === filterStatus.value)
  }

  // Doctor filter
  if (filterDoctor.value) {
    result = result.filter(feedback => feedback.doctor.id === filterDoctor.value)
  }

  // Date filter
  if (filterDate.value) {
    result = result.filter(feedback =>
      feedback.createdAt.startsWith(filterDate.value)
    )
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFeedbacks.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredFeedbacks.value.length / itemsPerPage.value))

const startRecord = computed(() => {
  if (filteredFeedbacks.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return Math.min(end, filteredFeedbacks.value.length)
})

const feedbackStats = computed(() => {
  const total = feedbacks.value.length
  const positive = feedbacks.value.filter(f => f.rating >= 4).length
  const negative = feedbacks.value.filter(f => f.rating <= 2).length
  const averageRating = feedbacks.value.reduce((sum, f) => sum + f.rating, 0) / total || 0

  return {
    total,
    positive,
    negative,
    averageRating
  }
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'pending': return 'warning'
    case 'hidden': return 'danger'
    default: return 'secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'published': return 'Đã xuất bản'
    case 'pending': return 'Chờ duyệt'
    case 'hidden': return 'Đã ẩn'
    default: return status
  }
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  isModalOpen.value = true
}

const editFeedback = (feedback: Feedback) => {
  isEditing.value = true
  feedbackForm.value = {
    id: feedback.id,
    patientId: feedback.patient.id,
    doctorId: feedback.doctor.id,
    title: feedback.title,
    content: feedback.content,
    rating: feedback.rating,
    status: feedback.status,
    tags: [...feedback.tags]
  }
  isModalOpen.value = true
}

const viewFeedback = (feedback: Feedback) => {
  selectedFeedback.value = feedback
  isViewModalOpen.value = true
}

const deleteFeedback = (id: string) => {
  if (confirm('Bạn có chắc chắn muốn xóa feedback này?')) {
    const index = feedbacks.value.findIndex(f => f.id === id)
    if (index !== -1) {
      feedbacks.value.splice(index, 1)
    }
  }
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const closeViewModal = () => {
  isViewModalOpen.value = false
  selectedFeedback.value = null
}

const resetForm = () => {
  feedbackForm.value = {
    id: '',
    patientId: '',
    doctorId: '',
    title: '',
    content: '',
    rating: 5,
    status: 'published',
    tags: []
  }
  tagsInput.value = ''
}

const addTag = () => {
  if (tagsInput.value.trim()) {
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    feedbackForm.value.tags.push(...tags)
    tagsInput.value = ''
  }
}

const removeTag = (index: number) => {
  feedbackForm.value.tags.splice(index, 1)
}

const saveFeedback = async () => {
  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEditing.value) {
      // Update existing feedback
      const index = feedbacks.value.findIndex(f => f.id === feedbackForm.value.id)
      if (index !== -1) {
        const patient = patientOptions.value.find(p => p.value === feedbackForm.value.patientId)
        const doctor = doctorOptions.value.find(d => d.value === feedbackForm.value.doctorId)

        feedbacks.value[index] = {
          ...feedbacks.value[index],
          title: feedbackForm.value.title,
          content: feedbackForm.value.content,
          rating: feedbackForm.value.rating,
          status: feedbackForm.value.status as any,
          tags: [...feedbackForm.value.tags],
          updatedAt: new Date().toISOString()
        }
      }
    } else {
      // Create new feedback
      const newFeedback: Feedback = {
        id: `FB${String(feedbacks.value.length + 1).padStart(3, '0')}`,
        patient: {
          id: feedbackForm.value.patientId,
          name: patientOptions.value.find(p => p.value === feedbackForm.value.patientId)?.text || '',
          email: 'patient@email.com',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
        },
        doctor: {
          id: feedbackForm.value.doctorId,
          name: doctorOptions.value.find(d => d.value === feedbackForm.value.doctorId)?.text || '',
          department: 'Khoa',
          specialization: 'Chuyên khoa',
          avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg'
        },
        title: feedbackForm.value.title,
        content: feedbackForm.value.content,
        rating: feedbackForm.value.rating,
        status: feedbackForm.value.status as any,
        tags: [...feedbackForm.value.tags],
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      feedbacks.value.unshift(newFeedback)
    }

    closeModal()
  } catch (error) {
    console.error('Error saving feedback:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch([searchQuery, filterRating, filterStatus, filterDoctor, filterDate], () => {
  currentPage.value = 1
})

onMounted(() => {
  console.log('Patient Feedback Forum loaded')
})
</script>

<style lang="scss" scoped>
.feedback-forum-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  .page-header {
    margin-bottom: 2rem;

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--va-text-primary);
      margin: 0 0 0.5rem;
    }

    .page-subtitle {
      color: var(--va-text-secondary);
      font-size: 1rem;
      margin: 0;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;

          &.total {
            background: linear-gradient(135deg, #5D5FEF, #4C4FE8);
          }

          &.positive {
            background: linear-gradient(135deg, #3DC47E, #2EAA6B);
          }

          &.negative {
            background: linear-gradient(135deg, #E84D39, #D32F2F);
          }

          &.average {
            background: linear-gradient(135deg, #FFC107, #FF9800);
          }
        }

        .stat-info {
          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--va-text-primary);
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.875rem;
            color: var(--va-text-secondary);
          }
        }
      }
    }
  }

  .filters-card {
    margin-bottom: 2rem;

    .filters-container {
      .filter-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;

        &:last-child {
          margin-bottom: 0;
        }

        .search-input {
          flex: 2;
        }

        .filter-select {
          flex: 1;
        }
      }
    }
  }

  .feedback-list {
    .feedback-card {
      margin-bottom: 1.5rem;

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .patient-info {
          display: flex;
          align-items: center;
          gap: 1rem;

          .patient-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
          }

          .patient-details {
            .patient-name {
              font-size: 1.125rem;
              font-weight: 600;
              margin: 0 0 0.25rem;
              color: var(--va-text-primary);
            }

            .patient-meta {
              font-size: 0.875rem;
              color: var(--va-text-secondary);
              margin: 0;
            }
          }
        }

        .feedback-meta {
          display: flex;
          align-items: center;
          gap: 1rem;

          .rating-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .stars {
              display: flex;
              gap: 0.25rem;
            }

            .rating-text {
              font-weight: 500;
              color: var(--va-text-primary);
            }
          }
        }
      }

      .feedback-content {
        margin-bottom: 1rem;

        .doctor-info {
          margin-bottom: 1rem;

          .doctor-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--va-background);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            color: var(--va-primary);
          }
        }

        .feedback-text {
          margin-bottom: 1rem;

          .feedback-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
            color: var(--va-text-primary);
          }

          .feedback-description {
            color: var(--va-text-secondary);
            line-height: 1.6;
            margin: 0;
          }
        }

        .feedback-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .tag-chip {
            background: var(--va-background);
          }
        }
      }

      .feedback-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--va-border);

        .engagement-stats {
          display: flex;
          gap: 1rem;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            color: var(--va-text-secondary);
          }
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--va-text-secondary);

      .va-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        color: var(--va-text-primary);
      }

      p {
        margin: 0 0 1.5rem;
        font-size: 0.875rem;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;

    .pagination-info {
      font-size: 0.875rem;
      color: var(--va-text-secondary);
    }
  }

  .feedback-form {
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .form-group {
        flex: 1;
      }
    }

    .form-group {
      margin-bottom: 1rem;

      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--va-text-primary);
      }

      .rating-input {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .rating-star {
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: var(--va-warning) !important;
          }
        }

        .rating-value {
          font-weight: 500;
          color: var(--va-text-primary);
        }
      }

      .tags-preview {
        margin-top: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .feedback-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--va-border);

      .patient-section {
        display: flex;
        align-items: center;
        gap: 1rem;

        .detail-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .patient-info {
          h3 {
            margin: 0 0 0.25rem;
            font-size: 1.25rem;
            color: var(--va-text-primary);
          }

          p {
            margin: 0;
            font-size: 0.875rem;
            color: var(--va-text-secondary);
          }
        }
      }

      .rating-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .rating-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--va-text-primary);
        }
      }
    }

    .detail-content {
      .doctor-info {
        margin-bottom: 2rem;

        h4 {
          margin: 0 0 1rem;
          color: var(--va-text-primary);
        }

        .doctor-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--va-background);
          border-radius: 8px;

          .doctor-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
          }

          .doctor-details {
            h5 {
              margin: 0 0 0.25rem;
              color: var(--va-text-primary);
            }

            p {
              margin: 0;
              font-size: 0.875rem;
              color: var(--va-text-secondary);
            }
          }
        }
      }

      .feedback-content {
        margin-bottom: 2rem;

        h4 {
          margin: 0 0 1rem;
          font-size: 1.25rem;
          color: var(--va-text-primary);
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: var(--va-text-secondary);
        }
      }

      .tags-section {
        margin-bottom: 2rem;

        h4 {
          margin: 0 0 1rem;
          color: var(--va-text-primary);
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }

      .engagement-section {
        h4 {
          margin: 0 0 1rem;
          color: var(--va-text-primary);
        }

        .engagement-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;

          .engagement-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--va-background);
            border-radius: 8px;
            color: var(--va-text-secondary);
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .feedback-forum-page {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .feedback-forum-page {
    padding: 1rem;

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .filters-container {
      .filter-row {
        flex-direction: column;
      }
    }

    .feedback-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .feedback-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;

      .action-buttons {
        justify-content: center;
      }
    }

    .form-row {
      flex-direction: column;
    }

    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .engagement-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
