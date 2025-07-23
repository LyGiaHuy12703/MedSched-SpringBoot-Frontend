<template>
  <div class="payment-result">
    <div class="container">
      <div class="result-card">
        <!-- Animated Status Icon -->
        <div class="status-icon-wrapper">
          <div class="status-icon" :class="iconClass">
            <svg v-if="status === 'success'" width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                class="circle-bg"
              />
              <path
                d="m9 12 2 2 4-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="check-mark"
              />
            </svg>
            <svg v-if="status === 'error'" width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                class="circle-bg"
              />
              <path
                d="m15 9-6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="x-mark"
              />
              <path
                d="m9 9 6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="x-mark"
              />
            </svg>
            <svg v-if="status === 'warning'" width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                class="circle-bg"
              />
              <path
                d="M12 8v4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="warning-line"
              />
              <circle cx="12" cy="16" r="1" fill="currentColor" class="warning-dot" />
            </svg>
          </div>
          <div class="status-glow" :class="glowClass"></div>
        </div>

        <!-- Title with Animation -->
        <h1 class="result-title" :class="titleClass">
          {{
            status === 'success'
              ? 'Thanh toán thành công!'
              : status === 'warning'
                ? 'Chưa đăng ký - Cần xác nhận!'
                : 'Thanh toán thất bại!'
          }}
        </h1>

        <!-- Message -->
        <p class="result-message">
          {{
            status === 'success'
              ? 'Cảm ơn bạn đã đặt lịch khám. Lịch hẹn của bạn đã được xác nhận.'
              : status === 'warning'
                ? 'Tài khoản của bạn chưa đăng ký vào hệ thống đặt lịch hẹn. Vui lòng kiểm tra email để nhận hướng dẫn tiếp theo, bao gồm thông tin thanh toán hoặc xác nhận từ nhân viên y tế.'
                : message ||
                  'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần thiết.'
          }}
        </p>

        <!-- Payment Instruction (for success or warning case)
        <div v-if="status === 'success' || status === 'warning'" class="payment-instruction">
          <va-icon name="email" color="primary" />
          <span>
            Vui lòng kiểm tra email để cập nhật trạng thái hoặc hoàn tất thanh toán. Nếu không nhận
            được email, hãy kiểm tra thư mục spam.
          </span>
        </div> -->

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            v-if="status === 'error' || status === 'warning'"
            class="btn btn-secondary"
            @click="goToRegister"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v16m8-8H4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Đăng ký tài khoản
          </button>

          <button class="btn btn-primary" @click="goToHome">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="9,22 9,12 15,12 15,22"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Quay về trang chủ
          </button>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// Props
const props = withDefaults(
  defineProps<{
    status?: 'success' | 'error' | 'warning'
    orderId?: string
    message?: string
  }>(),
  {
    status: 'success',
  },
)

// Computed properties for styling
const iconClass = computed(() => ({
  success: props.status === 'success',
  error: props.status === 'error',
  warning: props.status === 'warning',
}))

const glowClass = computed(() => ({
  'success-glow': props.status === 'success',
  'error-glow': props.status === 'error',
  'warning-glow': props.status === 'warning',
}))

const titleClass = computed(() => ({
  'success-title': props.status === 'success',
  'error-title': props.status === 'error',
  'warning-title': props.status === 'warning',
}))

// Event handlers
const goToRegister = () => {
  router.push({ name: 'Register' }) // Điều hướng đến trang đăng ký
}

const goToHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.payment-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  align-items: center;
  height: 60vh;
}

.payment-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardSlideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2s ease-in-out;
}

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.status-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  animation: iconPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
}

.status-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-icon.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.status-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

.success-glow {
  background: radial-gradient(circle, #10b981, transparent);
}

.error-glow {
  background: radial-gradient(circle, #ef4444, transparent);
}

.warning-glow {
  background: radial-gradient(circle, #f59e0b, transparent);
}

@keyframes iconPop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

.circle-bg {
  animation: drawCircle 0.8s ease-out 0.5s both;
}

.check-mark {
  stroke-dasharray: 8;
  stroke-dashoffset: 8;
  animation: drawCheck 0.6s ease-out 1s both;
}

.x-mark {
  stroke-dasharray: 8;
  stroke-dashoffset: 8;
  animation: drawX 0.6s ease-out 1s both;
}

.warning-line {
  stroke-dasharray: 4;
  stroke-dashoffset: 4;
  animation: drawWarning 0.6s ease-out 1s both;
}

.warning-dot {
  animation: dotPulse 1s ease-in-out infinite;
}

@keyframes drawCircle {
  0% {
    stroke-dasharray: 0 62.83;
  }
  100% {
    stroke-dasharray: 62.83 62.83;
  }
}

@keyframes drawCheck {
  0% {
    stroke-dashoffset: 8;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes drawX {
  0% {
    stroke-dashoffset: 8;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes drawWarning {
  0% {
    stroke-dashoffset: 4;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.result-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  animation: titleSlide 0.8s ease-out 0.4s both;
}

.success-title {
  background: linear-gradient(135deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.warning-title {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes titleSlide {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.result-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 1rem;
  animation: messageSlide 0.8s ease-out 0.6s both;
}

.payment-instruction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3b82f6;
  animation: instructionSlide 0.8s ease-out 0.7s both;

  span {
    font-size: 0.95rem;
    color: #374151;
    line-height: 1.5;
  }

  .va-icon {
    flex-shrink: 0;
  }
}

@keyframes instructionSlide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.order-info {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  animation: orderInfoSlide 0.8s ease-out 0.7s both;
}

.order-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  display: block;
  margin-bottom: 0.25rem;
}

.order-id {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Monaco', 'Menlo', monospace;
}

@keyframes orderInfoSlide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: buttonsSlide 0.8s ease-out 0.8s both;
}

@keyframes buttonsSlide {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  color: #475569;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 14px 0 rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(148, 163, 184, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  width: 60px;
  height: 60px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 40px;
  height: 40px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .result-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .result-title {
    font-size: 1.875rem;
  }

  .result-message {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .status-icon {
    width: 64px;
    height: 64px;
  }

  .status-glow {
    width: 100px;
    height: 100px;
  }

  .result-title {
    font-size: 1.5rem;
  }
}
</style>
