```vue
<template>
  <div class="add-medicine">
    <va-card class="medicine-card">
      <va-card-content>
        <va-card-title class="header">
          <va-icon name="local_pharmacy" color="primary" class="mr-1"></va-icon>
          <h1 class="va-h4 title-text">Dữ liệu thuốc</h1>
        </va-card-title>
        <div class="section-title">Thông tin cơ bản</div>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="tag" size="small" class="mr-1"></va-icon>
              <span class="label-text">Tên thuốc</span>
            </div>
            <p class="value-text">{{ medicineData.name }}</p>
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="attach_money" size="small" class="mr-1"></va-icon>
              <span class="label-text">Giá</span>
            </div>
            <p class="value-text">{{ medicineData.price }} VNĐ</p>
          </div>
        </div>
        <div class="section-title mt-2">Chi tiết sử dụng</div>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="category" size="small" class="mr-1"></va-icon>
              <span class="label-text">Dạng bào chế</span>
            </div>
            <p class="value-text">{{ medicineData.formulation }}</p>
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="group_work" size="small" class="mr-1"></va-icon>
              <span class="label-text">Nhóm điều trị</span>
            </div>
            <p class="value-text">{{ medicineData.therapeuticGroup }}</p>
          </div>
        </div>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="description" size="small" class="mr-1"></va-icon>
              <span class="label-text">Mô tả</span>
            </div>
            <p class="value-text">{{ medicineData.description }}</p>
          </div>
        </div>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="healing" size="small" class="mr-1"></va-icon>
              <span class="label-text">Liều lượng và cách dùng</span>
            </div>
            <p class="value-text">{{ medicineData.dosage }}</p>
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="assignment" size="small" class="mr-1"></va-icon>
              <span class="label-text">Chỉ định</span>
            </div>
            <p class="value-text">{{ medicineData.indications[0].description }}</p>
          </div>
        </div>
        <div class="section-title mt-2">Thông tin an toàn</div>
        <div class="add-grid">
          <div class="add-item">
            <div class="label">
              <va-icon name="block" size="small" class="mr-1"></va-icon>
              <span class="label-text">Chống chỉ định</span>
            </div>
            <p class="value-text">{{ medicineData.contraindications[0].description }}</p>
          </div>
          <div class="add-item">
            <div class="label">
              <va-icon name="warning" size="small" class="mr-1"></va-icon>
              <span class="label-text">Thận trọng</span>
            </div>
            <p class="value-text">{{ medicineData.cautions[0].description }}</p>
          </div>
        </div>
        <div class="add-grid">
          <div class="add-item full-width">
            <div class="label">
              <va-icon name="sick" size="small" class="mr-1"></va-icon>
              <span class="label-text">Tác dụng phụ</span>
            </div>
            <p class="value-text">{{ medicineData.sideEffects[0].description }}</p>
          </div>
        </div>
        <div class="section-title mt-2">Thông tin bổ sung</div>
        <div class="add-grid">
          <div class="add-item full-width">
            <div class="label">
              <va-icon name="note" size="small" class="mr-1"></va-icon>
              <span class="label-text">Ghi chú</span>
            </div>
            <p class="value-text">{{ medicineData.notes || 'Không có ghi chú' }}</p>
          </div>
          <div class="add-item full-width">
            <div class="label">
              <va-icon name="menu_book" size="small" class="mr-1"></va-icon>
              <span class="label-text">Tài liệu tham khảo</span>
            </div>
            <p class="value-text">{{ medicineData.referenceDocuments }}</p>
          </div>
        </div>
        <VaCardActions class="actions">
          <VaButton
            @click="$emit('close-modal')"
            preset="primary"
            color="secondary"
            class="action-button"
            >Hủy</VaButton
          >
        </VaCardActions>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import type { Medicine } from '@/interfaces/medicine.interface'

const props = defineProps<{
  medicineData: Medicine
}>()
const medicineData = props.medicineData
</script>

<style scoped lang="scss">
.add-medicine {
  padding: 1rem;

  .medicine-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    min-width: 600px;
    max-width: 900px;
    margin: 0 auto;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--va-background-border);

    .title-text {
      font-weight: 600;
      color: var(--va-primary);
      margin: 0;
      font-size: 1.1rem;
    }
  }

  .section-title {
    font-weight: 600;
    color: var(--va-primary);
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    padding: 0.5rem 0.75rem;
    background: var(--va-background-secondary);
    border-radius: 4px;
  }

  .add-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    padding: 0.75rem;

    &.mt-2 {
      margin-top: 1rem;
    }
  }

  .add-item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-radius: 6px;
    background: var(--va-background-secondary);
    border: 1px solid var(--va-background-border);
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--va-background-element);
    }

    &.full-width {
      grid-column: 1 / -1;
    }

    .label {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: var(--va-primary);
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .value-text {
      font-size: 0.9rem;
      color: var(--va-text-primary);
      margin: 0;
      padding: 0.25rem 0;
      word-break: break-word;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 0.75rem;
    border-top: 1px solid var(--va-background-border);

    .action-button {
      font-weight: 500;
      border-radius: 4px;
      font-size: 0.9rem;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  @media (max-width: 768px) {
    .add-grid {
      grid-template-columns: 1fr;
    }

    .add-item {
      padding: 0.75rem;
    }

    .actions {
      flex-direction: column;

      .action-button {
        width: 100%;
        margin-bottom: 0.25rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .medicine-card {
      min-width: 100%;
      max-width: 100%;
      margin: 0;
    }
  }
}
</style>
```
