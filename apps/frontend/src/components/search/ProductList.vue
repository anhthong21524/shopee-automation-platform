<template>
  <section class="product-list">
    <header class="product-list__header">
      <div>
        <h2 class="section-heading">Results for "{{ keyword }}"</h2>
        <p class="section-copy">{{ total }} product{{ total === 1 ? '' : 's' }} found</p>
      </div>
    </header>

    <div class="product-list__grid">
      <ProductCard v-for="product in products" :key="product.url" :product="product" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductCandidate } from '@shopee-automation/shared';
import ProductCard from './ProductCard.vue';

defineProps<{
  keyword: string;
  total: number;
  products: ProductCandidate[];
}>();
</script>

<style scoped>
.product-list {
  display: grid;
  gap: 20px;
  padding-top: 34px;
}

.product-list__header h2,
.product-list__header p {
  margin: 0;
}

.section-heading {
  color: #071a37;
  font-size: 18px;
  font-weight: 700;
}

.section-copy {
  margin-top: 6px;
  color: var(--text-soft);
  font-size: 15px;
}

.product-list__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 1100px) {
  .product-list__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .product-list {
    padding-top: 24px;
  }

  .product-list__grid {
    grid-template-columns: 1fr;
  }
}
</style>
