<template>
  <article class="product-card">
    <div class="product-card__media">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.title"
        class="product-card__image"
        loading="lazy"
      />
      <div v-else class="product-card__image product-card__image--placeholder" aria-hidden="true">
        {{ fallbackInitial }}
      </div>
    </div>

    <div class="product-card__body">
      <a :href="product.url" target="_blank" rel="noopener noreferrer" class="product-card__title">
        {{ product.title }}
      </a>
      <p class="product-card__price">{{ formattedPrice }}</p>
      <div class="product-card__meta">
        <span class="product-card__rating">
          <span class="product-card__star">★</span>
          {{ formattedRating }}
        </span>
        <span class="product-card__sold">{{ formattedSold }}</span>
      </div>
      <p class="product-card__shop">{{ product.shopName || 'Official Store' }}</p>
      <a :href="product.url" target="_blank" rel="noopener noreferrer" class="product-card__link">
        <span>View on Shopee</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14 4h6v6h-1.5V6.56l-8.72 8.72-1.06-1.06 8.72-8.72H14V4ZM6.75 7A1.75 1.75 0 0 0 5 8.75v8.5C5 18.216 5.784 19 6.75 19h8.5c.966 0 1.75-.784 1.75-1.75V13H18.5v4.25A3.25 3.25 0 0 1 15.25 20.5h-8.5A3.25 3.25 0 0 1 3.5 17.25v-8.5A3.25 3.25 0 0 1 6.75 5.5H11V7H6.75Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProductCandidate } from '@shopee-automation/shared';

const props = defineProps<{
  product: ProductCandidate;
}>();

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(props.product.price),
);

const fallbackInitial = computed(() => props.product.title.trim().charAt(0).toUpperCase() || 'S');
const formattedRating = computed(() => (props.product.rating ?? 5).toFixed(1));
const formattedSold = computed(() => {
  const soldCount = props.product.soldCount ?? 0;
  if (soldCount >= 1000) {
    return `${(soldCount / 1000).toFixed(1)}k sold`;
  }

  return `${soldCount} sold`;
});
</script>

<style scoped>
.product-card {
  overflow: hidden;
  border: 1px solid #d8e0ea;
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow);
}

.product-card__media {
  aspect-ratio: 1.36 / 1;
  background: #eef2f7;
}

.product-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__image--placeholder {
  display: grid;
  place-items: center;
  color: #8f9bb0;
  font-size: 1.5rem;
  font-weight: 800;
}

.product-card__body {
  display: grid;
  gap: 8px;
  padding: 13px 13px 15px;
}

.product-card__title {
  display: -webkit-box;
  min-height: 38px;
  overflow: hidden;
  color: #071a37;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__title:hover {
  color: var(--accent);
}

.product-card__price {
  margin: 0;
  color: var(--accent);
  font-size: 14px;
  font-weight: 700;
}

.product-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #55657f;
  font-size: 13px;
}

.product-card__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.product-card__star {
  color: #ffb800;
}

.product-card__shop {
  margin: 0;
  color: #6b7b93;
  font-size: 13px;
}

.product-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  gap: 6px;
  border-radius: 9px;
  background: #f8562c;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.product-card__link:hover {
  background: #eb4e27;
}

.product-card__link svg {
  width: 14px;
  height: 14px;
}
</style>
