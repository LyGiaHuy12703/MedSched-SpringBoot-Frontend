<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: [
            12000, 19000, 15000, 25000, 22000, 30000, 28000, 25000, 38000, 41000, 35000, 50000,
          ],
          borderColor: '#5D5FEF',
          backgroundColor: 'rgba(93, 95, 239, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }),
  },
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false,
      },
      ticks: {
        callback: function (value: number) {
          return value.toLocaleString()
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
})
</script>

<template>
  <div class="line-chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style lang="scss" scoped>
.line-chart-container {
  height: 100%;
  width: 100%;
}
</style>
