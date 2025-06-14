<template>
  <footer class="app-footer-clean">
    <VaDivider />
    <div class="footer-content va-text-secondary">
      <div class="footer-main">
        <div class="brand-info">
          <VaIcon name="health_and_safety" color="secondary" size="24px" class="mr-2" />
          <span class="va-h5">MedSched</span>
          <p class="mt-2 text-sm">Chăm sóc sức khỏe toàn diện, <br />Kết nối bạn với chuyên gia.</p>
        </div>
        <div class="quick-links">
          <h6 class="va-h6 text--primary mb-2">Liên kết nhanh</h6>
          <RouterLink to="/about-us" class="footer-link">Về chúng tôi</RouterLink>
          <RouterLink to="/faq" class="footer-link">Câu hỏi thường gặp</RouterLink>
          <RouterLink to="/careers" class="footer-link">Tuyển dụng</RouterLink>
        </div>
        <div class="contact-info">
          <h6 class="va-h6 text--primary mb-2">Liên hệ</h6>
          <p><VaIcon name="call" size="small" class="mr-1" /> (028) 1234 5678</p>
          <p><VaIcon name="email" size="small" class="mr-1" /> giahuy.53870@gmail.com</p>
          <p><VaIcon name="location_on" size="small" class="mr-1" /> Ninh Kieu, Can Tho</p>
        </div>
      </div>
      <VaDivider class="my-4" />
      <div class="copyright-socials">
        <span>© {{ new Date().getFullYear() }} MedSched. All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>


<style scoped>
.app-footer-clean {
  background-color: var(--va-background-element); /* Màu nền hơi khác một chút */
  padding-top: 1rem; /* Khoảng đệm trên cho VaDivider */
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem; /* Hoặc var(--va-container-padding-x) */
}

.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap; /* Cho responsive */
}

.brand-info,
.quick-links,
.contact-info {
  flex: 1;
  min-width: 200px; /* Đảm bảo không quá hẹp trên mobile */
}

.brand-info .va-h5 {
  color: var(--va-primary);
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.4;
}

.footer-link {
  display: block;
  color: var(--va-text-secondary);
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.footer-link:hover {
  color: var(--va-primary);
}

.copyright-socials {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
}

.social-icons .va-button {
  margin-left: 0.5rem;
}
</style>
