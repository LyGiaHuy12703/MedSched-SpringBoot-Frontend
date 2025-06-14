<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'trending_up',
  },
  change: {
    type: String,
    default: '0%',
  },
  trend: {
    type: String,
    default: 'up', // 'up' or 'down'
    validator: (value: string) => ['up', 'down'].includes(value),
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script>

<template>
  <va-card class="stat-card">
    <div class="stat-content">
      <div class="stat-icon" :class="`bg-${color}--light`">
        <va-icon :name="icon" :color="color" />
      </div>

      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">{{ value }}</div>

        <div
          class="stat-change"
          :class="{
            'trend-up': trend === 'up',
            'trend-down': trend === 'down',
          }"
        >
          <va-icon :name="trend === 'up' ? 'trending_up' : 'trending_down'" size="small" />
          <span>{{ change }}</span>
        </div>
      </div>
    </div>
  </va-card>
</template>

<style lang="scss" scoped>
.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 1rem;

  .va-icon {
    font-size: 1.5rem;
  }
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-change {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 500;

  .va-icon {
    margin-right: 0.25rem;
  }

  &.trend-up {
    color: var(--va-success);
  }

  &.trend-down {
    color: var(--va-danger);
  }
}
</style>
