```vue
<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const schedules = ref([
  { id: '1', doctorName: 'BS. Nguyễn Văn A', date: '2025-05-21 09:00', specialty: 'Tim mạch' },
  { id: '2', doctorName: 'BS. Trần Thị B', date: '2025-05-21 14:00', specialty: 'Thần kinh' },
])
</script>

<template>
  <div class="schedule-grid">
    <va-card v-for="item in schedules" :key="item.id" class="schedule-card">
      <va-card-content>
        <h3 class="va-h5">{{ item.doctorName }}</h3>
        <p class="va-text-secondary">{{ item.specialty }}</p>
        <p class="va-text-secondary">{{ item.date }}</p>
        <va-button
          preset="primary"
          size="small"
          @click="toast.info(`Đặt lịch với ${item.doctorName}`)"
        >
          Đặt lịch
        </va-button>
      </va-card-content>
    </va-card>
  </div>
</template>

<style lang="scss" scoped>
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
}

.schedule-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .va-card-content {
    padding: 1.5rem;

    .va-h5 {
      margin-bottom: 0.5rem;
    }

    .va-text-secondary {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .va-button {
      margin-top: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .schedule-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .schedule-grid {
    padding: 0 0.5rem;
  }
}
</style>
```
