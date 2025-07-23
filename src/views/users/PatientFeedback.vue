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
            <div class="stat-label">Feedback</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ averageRating.toFixed(1) }}</div>
            <div class="stat-label">Điểm TB</div>
          </div>
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
          <va-chip color="info" size="small" class="count-chip">
            {{ paginatedFeedbacks.length }} / {{ meta?.total || 0 }}
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
      <div v-else-if="paginatedFeedbacks.length > 0" :class="['feedback-grid', viewMode]">
        <div v-for="feedback in paginatedFeedbacks" :key="feedback.id" class="feedback-card">
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
                      <va-icon name="fiber_new" size="small" color="success" />
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
                      :color="star <= feedback.rating ? 'warning' : 'gray'"
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
                  @click="deleteFeedback(feedback.id)"
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
        @update:model-value="fetchFeedbacks"
        class="pagination-component"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PatientFeedback } from '@/interfaces/patientFeedback.interfaces'
import { usePatientFeedbackStore } from '@/stores/patientFeedback.store'
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { debounce } from 'lodash-es'

// State
const searchQuery = ref('')
const filterRating = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const viewMode = ref<'grid' | 'list'>('grid')
const loading = ref(false)

// Store
const feedbackStore = usePatientFeedbackStore()

// Computed
const feedbacks = computed(() => feedbackStore.feedbacks)
const meta = computed(() => feedbackStore.meta)
const paginatedFeedbacks = computed(() => {
  if (!filterRating.value) return feedbacks.value
  return feedbacks.value.filter((f) => f.rating === Number(filterRating.value))
})
const totalPages = computed(() => Math.ceil((meta.value?.total || 0) / itemsPerPage.value))
const startRecord = computed(() =>
  meta.value?.total ? (meta.value.page - 1) * itemsPerPage.value + 1 : 0,
)
const endRecord = computed(() =>
  Math.min(meta.value?.page * itemsPerPage.value, meta.value?.total || 0),
)
const averageRating = computed(() => {
  if (!feedbacks.value.length) return 0
  const sum = feedbacks.value.reduce((acc, feedback) => acc + feedback.rating, 0)
  return sum / feedbacks.value.length
})

// Methods
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
  return diffInHours < 24
}

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    await feedbackStore.fetchPatientFeedbacks(0, itemsPerPage.value, searchQuery.value)
    if (feedbackStore.error) {
      toast.error(feedbackStore.error)
    }
  } catch (err) {
    toast.error('Không thể tải danh sách phản hồi.')
  } finally {
    loading.value = false
  }
}

const deleteFeedback = async (id: string) => {
  if (!confirm('Bạn có chắc muốn xóa feedback này?')) return
  try {
    await feedbackStore.deletePatientFeedback(id)
    toast.success('Xóa feedback thành công.')
  } catch (err) {
    toast.error('Không thể xóa feedback.')
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterRating.value = ''
  Ascending(1)
  currentPage.value = 1
  fetchFeedbacks()
}

const debouncedFetch = debounce(fetchFeedbacks, 500)

// Watchers
watch([searchQuery, filterRating, currentPage], debouncedFetch, { immediate: true })

// Lifecycle
onMounted(fetchFeedbacks)
</script>

<style lang="scss" scoped>
.feedback-forum-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;

  .hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
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

  .stats-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 clamp(0.75rem, 2vw, 1rem);

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        &.total .stat-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        &.positive .stat-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        &.negative .stat-icon {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        &.average .stat-icon {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-content {
          .stat-number {
            font-size: clamp(1.5rem, 4vw, 1.75rem);
            font-weight: 700;
            color: var(--va-text-primary);
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem);
            font-weight: 600;
            color: var(--va-text-primary);
          }
        }
      }
    }
  }

  .filters-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 clamp(0.75rem, 2vw, 1rem);

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .filters-title {
        font-size: clamp(1.25rem, 3vw, 1.5rem);
        font-weight: 600;
        display: flex;
        align-items: center;

        .title-icon {
          margin-right: 0.5rem;
        }
      }
    }

    .filters-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;

      &.list {
        grid-template-columns: 1fr;
      }

      .feedback-card {
        .card-inner {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
            border-color: var(--va-primary);
          }

          &.urgent {
            border-color: #ff6b6b;
            background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
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
                  border: 2px solid var(--va-primary);
                }

                .recent-badge {
                  position: absolute;
                  bottom: -5px;
                  right: -5px;
                  background: var(--va-success);
                  border-radius: 50%;
                  padding: 0.25rem;
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

            .feedback-text {
              font-size: clamp(0.85rem, 2vw, 0.9rem);
              color: var(--va-text-secondary);
              line-height: 1.6;
              margin: 0 0 0.75rem;
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

  @media (max-width: 1200px) {
    .stats-grid,
    .filters-controls {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
    .feedback-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: clamp(1.5rem, 4vw, 2rem) clamp(0.75rem, 2vw, 1rem);
    }
    .hero-content .hero-text .hero-title {
      font-size: clamp(1.5rem, 4vw, 1.8rem);
    }
    .hero-stats {
      flex-direction: column;
      gap: 1rem;
    }
    .stats-section,
    .filters-section,
    .feedback-section,
    .pagination-container {
      padding: 0 clamp(0.5rem, 1.5vw, 0.75rem);
    }
    .stats-grid,
    .filters-controls {
      grid-template-columns: 1fr;
    }
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .pagination-container {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .stat-card {
      padding: 1rem;
    }
    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
    .stat-content .stat-number {
      font-size: clamp(1.25rem, 3vw, 1.5rem);
    }
    .feedback-card .card-inner {
      padding: 0.75rem;
    }
    .patient-avatar {
      width: 36px;
      height: 36px;
    }
    .empty-state {
      padding: 1.5rem 0.75rem;
    }
  }
}
</style>
