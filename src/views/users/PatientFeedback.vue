<template>
  <div class="feedback-forum-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Diễn đàn Feedback Bệnh nhân</h1>
          <p class="hero-subtitle">Theo dõi và quản lý đánh giá của bệnh nhân về dịch vụ y tế</p>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ meta?.total || 0 }}</div>
            <div class="stat-label">Tổng Feedback</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ averageRating.toFixed(1) }}</div>
            <div class="stat-label">Điểm TB</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-controls">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="Tìm theo tên bệnh nhân, nội dung..."
            clearable
            class="search-input"
          >
            <template #prependInner>
              <va-icon name="search" />
            </template>
          </va-input>
        </div>
        <div class="filter-item">
          <va-select
            v-model="filterRating"
            placeholder="Lọc theo rating"
            :options="[
              { text: '5 sao', value: 5 },
              { text: '4 sao', value: 4 },
              { text: '3 sao', value: 3 },
              { text: '2 sao', value: 2 },
              { text: '1 sao', value: 1 },
            ]"
            value-by="value"
            clearable
            class="filter-select"
          />
        </div>
        <div class="filter-item">
          <va-button preset="secondary" @click="clearFilters">
            <va-icon name="refresh" />
            Xóa bộ lọc
          </va-button>
        </div>
      </div>
    </div>

    <!-- Feedback Section -->
    <div class="feedback-section">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">
            <va-icon name="forum" class="section-icon" />
            Danh sách feedback
          </h2>
          <va-chip v-if="meta?.total" color="info" size="small" class="count-chip">
            {{ feedbacks.length }} / {{ meta.total }}
          </va-chip>
        </div>
        <div class="header-right">
          <va-button-group>
            <va-button
              :preset="viewMode === 'grid' ? 'primary' : 'secondary'"
              icon="grid_view"
              size="small"
              @click="viewMode = 'grid'"
            />
            <va-button
              :preset="viewMode === 'list' ? 'primary' : 'secondary'"
              icon="view_list"
              size="small"
              @click="viewMode = 'list'"
            />
          </va-button-group>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <va-progress-circle indeterminate color="primary" size="large" />
        <p class="loading-text">Đang tải feedback...</p>
      </div>

      <!-- Feedback Grid/List -->
      <div v-else-if="feedbacks.length > 0" :class="['feedback-grid', viewMode]">
        <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
          <va-card class="card-inner" :class="{ urgent: isRecentFeedback(feedback.createdAt) }">
            <va-card-content>
              <div class="card-header">
                <div class="patient-section">
                  <div class="avatar-container">
                    <img
                      :src="feedback.user.avatar || '/defaultAvatar.png'"
                      :alt="feedback.user.name"
                      class="patient-avatar"
                    />
                    <div
                      v-if="isRecentFeedback(feedback.createdAt)"
                      class="recent-badge"
                      title="Feedback mới"
                    >
                      <va-icon name="fiber_new" size="small" color="white" />
                    </div>
                  </div>
                  <div class="patient-info">
                    <h4 class="patient-name">{{ feedback.user.name }}</h4>
                    <p class="feedback-time">
                      <va-icon name="schedule" size="small" />
                      {{ getTimeAgo(feedback.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="rating-section">
                  <div class="rating-stars">
                    <va-icon
                      v-for="star in 5"
                      :key="star"
                      name="star"
                      :color="star <= feedback.rating ? 'warning' : '#E0E0E0'"
                      size="small"
                      class="star"
                    />
                  </div>
                  <span class="rating-value">{{ feedback.rating }}/5</span>
                </div>
              </div>

              <div class="feedback-content">
                <p class="feedback-text">{{ feedback.feedback }}</p>
                <div v-if="feedback.tags?.length" class="tags-section">
                  <va-chip
                    v-for="tag in feedback.tags"
                    :key="tag"
                    size="small"
                    color="success"
                    class="tag-chip"
                  >
                    {{ tag }}
                  </va-chip>
                </div>
              </div>

              <div class="card-footer">
                <div class="footer-stats">
                  <div class="stat-item">
                    <va-icon name="calendar_today" size="small" />
                    <span>{{ formatDate(feedback.createdAt) }}</span>
                  </div>
                </div>
                <va-button
                  preset="danger"
                  icon="delete"
                  size="small"
                  @click="openDeleteConfirm(feedback.id)"
                >
                  Xóa
                </va-button>
              </div>
            </va-card-content>
          </va-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <va-icon name="forum" size="3rem" color="secondary" />
        </div>
        <h3 class="empty-title">Chưa có feedback nào</h3>
        <p class="empty-description">
          Không tìm thấy feedback phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc kiểm
          tra lại sau.
        </p>
        <va-button preset="primary" @click="clearFilters" class="empty-action">
          <va-icon name="refresh" class="mr-2" />
          Làm mới bộ lọc
        </va-button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination-info">
        <span class="info-text">
          Hiển thị <strong>{{ startRecord }}</strong> - <strong>{{ endRecord }}</strong> trong tổng
          số <strong>{{ meta?.total || 0 }}</strong> feedback
        </span>
      </div>
      <va-pagination
        v-model="currentPage"
        :pages="totalPages"
        :visible-pages="5"
        class="pagination-component"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <va-modal v-model="isDeleteModalOpen" hide-default-actions @close="isDeleteModalOpen = false">
      <DeleteConfirm
        title="Xác nhận xóa Feedback"
        message="Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác."
        @confirm="handleDeleteConfirm"
        @close-confirm="isDeleteModalOpen = false"
      />
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { usePatientFeedbackStore } from '@/stores/patientFeedback.store'
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { debounce } from 'lodash-es'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

// --- STATE MANAGEMENT ---
const feedbackStore = usePatientFeedbackStore()
const loading = ref(true)

// --- FILTERS & PAGINATION STATE ---
const searchQuery = ref('')
const filterRating = ref<number | ''>('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const viewMode = ref<'grid' | 'list'>('grid')

// --- MODAL STATE ---
const isDeleteModalOpen = ref(false)
const selectedFeedbackIdToDelete = ref<string | null>(null)

// --- COMPUTED PROPERTIES ---
const feedbacks = computed(() => feedbackStore.feedbacks)
const meta = computed(() => feedbackStore.meta)

// Dữ liệu `totalPages`, `startRecord`, `endRecord` được tính từ `meta` do backend trả về
const totalPages = computed(() => meta.value?.pages || 1)
const startRecord = computed(() =>
  meta.value?.total ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0,
)
const endRecord = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, meta.value?.total || 0),
)
// Giả định backend trả về `averageRating` trong meta để có số liệu chính xác
const averageRating = computed(() => meta.value?.averageRating || 0)

// --- METHODS ---

// Helper methods for formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`
  return formatDate(dateString)
}

const isRecentFeedback = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return diffInHours < 24 // Feedback trong vòng 24 giờ được coi là mới
}

// API call method
const fetchFeedbacks = async () => {
  loading.value = true
  try {
    // Truyền tất cả các tham số lọc và phân trang vào store
    await feedbackStore.fetchPatientFeedbacks(
      currentPage.value - 1, // API thường bắt đầu từ trang 0
      itemsPerPage.value,
      searchQuery.value,
      filterRating.value || undefined,
    )
    if (feedbackStore.error) {
      toast.error(feedbackStore.error)
    }
  } catch (err) {
    toast.error('Không thể tải danh sách phản hồi.')
  } finally {
    loading.value = false
  }
}

// Delete methods
const openDeleteConfirm = (id: string) => {
  selectedFeedbackIdToDelete.value = id
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (!selectedFeedbackIdToDelete.value) return
  try {
    await feedbackStore.deletePatientFeedback(selectedFeedbackIdToDelete.value)
    toast.success('Xóa feedback thành công.')
    isDeleteModalOpen.value = false
    // Tải lại dữ liệu sau khi xóa
    await fetchFeedbacks()
  } catch (err) {
    toast.error('Không thể xóa feedback.')
  }
}

// Filter controls
const clearFilters = () => {
  searchQuery.value = ''
  filterRating.value = ''
  if (currentPage.value !== 1) {
    currentPage.value = 1
  } else {
    // Nếu đã ở trang 1, watcher sẽ không tự trigger, cần gọi thủ công
    fetchFeedbacks()
  }
}

// Debounce API calls to avoid spamming
const debouncedFetch = debounce(fetchFeedbacks, 500)

// --- WATCHERS & LIFECYCLE ---
watch([searchQuery, filterRating, currentPage], debouncedFetch)

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style lang="scss" scoped>
/* Giữ nguyên toàn bộ CSS của bạn, vì nó đã rất đẹp và không cần thay đổi */
.feedback-forum-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;

  .hero-section {
    background: linear-gradient(135deg, rgba(93, 95, 239, 0.2), rgba(93, 95, 239, 0.05));
    color: var(--va-primary);
    padding: clamp(2rem, 5vw, 2.5rem) clamp(1rem, 3vw, 1.5rem);
    margin-bottom: 1.5rem;

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;

      .hero-text {
        .hero-title {
          font-size: clamp(1.8rem, 5vw, 2.2rem);
          font-weight: 700;
          margin: 0 0 0.75rem;
        }

        .hero-subtitle {
          font-size: clamp(0.9rem, 3vw, 1rem);
          opacity: 0.9;
        }
      }

      .hero-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        justify-content: center;

        .stat-item {
          flex: 1 1 100px;
          .stat-number {
            font-size: clamp(1.5rem, 4vw, 1.8rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: clamp(0.75rem, 2vw, 0.85rem);
            opacity: 0.8;
          }
        }
      }
    }
  }

  .filters-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 clamp(0.75rem, 2vw, 1rem);

    .filters-controls {
      display: grid;
      grid-template-columns: 2fr 1fr auto;
      gap: 1rem;
      align-items: center;

      .filter-item {
        .search-input,
        .filter-select {
          width: 100%;
          border-radius: 8px;
        }
      }
    }
  }

  .feedback-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(0.75rem, 2vw, 1rem) 2rem;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .section-title {
          font-size: clamp(1.5rem, 3vw, 1.75rem);
          font-weight: 600;
          display: flex;
          align-items: center;

          .section-icon {
            margin-right: 0.5rem;
          }
        }

        .count-chip {
          font-weight: 600;
          font-size: clamp(0.75rem, 2vw, 0.85rem);
        }
      }

      .header-right {
        .va-button-group {
          border-radius: 8px;
          overflow: hidden;

          .va-button {
            padding: 0.5rem;
            font-size: clamp(0.8rem, 2vw, 0.9rem);
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;

      .loading-text {
        margin-top: 1rem;
        font-size: clamp(0.9rem, 2.5vw, 1rem);
        color: var(--va-text-secondary);
      }
    }

    .feedback-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;

      &.list {
        grid-template-columns: 1fr;
      }

      .feedback-card {
        .card-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border-left: 4px solid transparent;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
            border-left-color: var(--va-primary);
          }

          &.urgent {
            border-left-color: var(--va-success);
          }

          .va-card-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;

            .patient-section {
              display: flex;
              align-items: center;
              gap: 1rem;

              .avatar-container {
                position: relative;

                .patient-avatar {
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 2px solid var(--va-primary-lightest);
                }

                .recent-badge {
                  position: absolute;
                  bottom: -2px;
                  right: -2px;
                  background: var(--va-success);
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid white;
                }
              }

              .patient-info {
                .patient-name {
                  font-size: clamp(1rem, 2.5vw, 1.1rem);
                  font-weight: 600;
                  margin: 0 0 0.25rem;
                }

                .feedback-time {
                  font-size: clamp(0.75rem, 2vw, 0.85rem);
                  color: var(--va-text-secondary);
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }
              }
            }

            .rating-section {
              display: flex;
              flex-direction: column;
              align-items: flex-end;

              .rating-stars {
                display: flex;
                gap: 0.25rem;
                margin-bottom: 0.25rem;

                .star {
                  transition: transform 0.2s ease;
                  &:hover {
                    transform: scale(1.1);
                  }
                }
              }

              .rating-value {
                font-size: clamp(0.75rem, 2vw, 0.85rem);
                font-weight: 600;
              }
            }
          }

          .feedback-content {
            margin-bottom: 1rem;
            flex-grow: 1;

            .feedback-text {
              font-size: clamp(0.85rem, 2vw, 0.9rem);
              color: var(--va-text-primary);
              line-height: 1.6;
              margin: 0 0 0.75rem;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 3;
              overflow: hidden;
              display: -webkit-box;
            }

            .tags-section {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;

              .tag-chip {
                font-size: clamp(0.7rem, 1.5vw, 0.75rem);
                border-radius: 16px;
              }
            }
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.75rem;
            border-top: 1px solid var(--va-background-border);

            .footer-stats {
              display: flex;
              gap: 1rem;

              .stat-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: clamp(0.75rem, 2vw, 0.85rem);
                color: var(--va-text-secondary);
              }
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .empty-icon {
        margin-bottom: 1rem;
        .va-icon {
          opacity: 0.5;
        }
      }

      .empty-title {
        font-size: clamp(1.25rem, 3vw, 1.5rem);
        font-weight: 600;
        margin: 0 0 0.75rem;
      }

      .empty-description {
        font-size: clamp(0.85rem, 2.5vw, 0.95rem);
        margin: 0 0 1.5rem;
      }

      .empty-action {
        font-size: clamp(0.85rem, 2vw, 0.95rem);
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
      }
    }
  }

  .pagination-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem clamp(0.75rem, 2vw, 1rem);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .pagination-info {
      .info-text {
        font-size: clamp(0.8rem, 2vw, 0.9rem);
        color: var(--va-text-secondary);

        strong {
          color: var(--va-text-primary);
          font-weight: 600;
        }
      }
    }

    .pagination-component {
      .va-pagination__item {
        border-radius: 8px;
        font-size: clamp(0.8rem, 2vw, 0.9rem);
      }
    }
  }

  @media (max-width: 768px) {
    .filters-controls {
      grid-template-columns: 1fr;
    }

    .feedback-grid {
      grid-template-columns: 1fr;
    }
    .pagination-container {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>
