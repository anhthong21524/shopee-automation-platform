<template>
  <section class="advanced-filters" data-testid="advanced-filters">
    <button
      type="button"
      class="advanced-filters__header"
      :aria-expanded="expanded ? 'true' : 'false'"
      @click="emit('toggle')"
    >
      <span>Advanced Filters</span>
      <svg
        class="advanced-filters__chevron"
        :class="{ 'advanced-filters__chevron--expanded': expanded }"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          d="M5.47 7.97a.75.75 0 0 1 1.06 0L10 11.44l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
          fill="currentColor"
        />
      </svg>
    </button>

    <div v-if="expanded" class="advanced-filters__body">
      <div class="advanced-filters__grid">
        <div class="field-group">
          <label class="field-label" for="min-price">Min Price</label>
          <input
            id="min-price"
            class="field-input"
            :value="minPrice"
            type="text"
            inputmode="numeric"
            placeholder="e.g. 100,000"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.minPrice)"
            :aria-describedby="errors.minPrice ? 'min-price-error' : undefined"
            @input="emit('update:minPrice', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="min-price-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.minPrice) }"
          >
            {{ errors.minPrice }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="max-price">Max Price</label>
          <input
            id="max-price"
            class="field-input"
            :value="maxPrice"
            type="text"
            inputmode="numeric"
            placeholder="e.g. 500,000"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.maxPrice)"
            :aria-describedby="errors.maxPrice ? 'max-price-error' : undefined"
            @input="emit('update:maxPrice', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="max-price-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.maxPrice) }"
          >
            {{ errors.maxPrice }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="minimum-rating">Minimum Rating</label>
          <input
            id="minimum-rating"
            class="field-input"
            :value="minimumRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="e.g. 4.5"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.minimumRating)"
            :aria-describedby="errors.minimumRating ? 'minimum-rating-error' : undefined"
            @input="emit('update:minimumRating', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="minimum-rating-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.minimumRating) }"
          >
            {{ errors.minimumRating }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="minimum-sold-count">Minimum Sold Count</label>
          <input
            id="minimum-sold-count"
            class="field-input"
            :value="minimumSoldCount"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 1000"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.minimumSoldCount)"
            :aria-describedby="errors.minimumSoldCount ? 'minimum-sold-count-error' : undefined"
            @input="emit('update:minimumSoldCount', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="minimum-sold-count-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.minimumSoldCount) }"
          >
            {{ errors.minimumSoldCount }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="minimum-review-count">Minimum Review Count</label>
          <input
            id="minimum-review-count"
            class="field-input"
            :value="minimumReviewCount"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 100"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.minimumReviewCount)"
            :aria-describedby="errors.minimumReviewCount ? 'minimum-review-count-error' : undefined"
            @input="emit('update:minimumReviewCount', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="minimum-review-count-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.minimumReviewCount) }"
          >
            {{ errors.minimumReviewCount }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="max-one-star-reviews">Max 1-Star Reviews</label>
          <input
            id="max-one-star-reviews"
            class="field-input"
            :value="maxOneStarReviews"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 10"
            :disabled="disabled"
            :aria-invalid="Boolean(errors.maxOneStarReviews)"
            :aria-describedby="errors.maxOneStarReviews ? 'max-one-star-reviews-error' : undefined"
            @input="emit('update:maxOneStarReviews', ($event.target as HTMLInputElement).value)"
          />
          <span
            id="max-one-star-reviews-error"
            class="field-error"
            :class="{ 'field-error--visible': Boolean(errors.maxOneStarReviews) }"
          >
            {{ errors.maxOneStarReviews }}
          </span>
        </div>
      </div>

      <div class="advanced-filters__footer">
        <div class="field-group field-group--sort">
          <label class="field-label" for="sort-by">Sort By</label>
          <select
            id="sort-by"
            class="field-input field-select"
            :value="sortBy"
            :disabled="disabled"
            @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
          >
            <option value="default">Default</option>
            <option value="price-low-to-high">Price Low to High</option>
            <option value="price-high-to-low">Price High to Low</option>
            <option value="highest-rating">Highest Rating</option>
            <option value="best-selling">Best Selling</option>
            <option value="most-reviewed">Most Reviewed</option>
          </select>
          <span class="field-error" aria-hidden="true"></span>
        </div>

        <div class="advanced-filters__actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="disabled"
            @click="emit('reset')"
          >
            Reset
          </button>
          <button
            type="button"
            class="primary-button"
            :disabled="disabled"
            @click="emit('apply')"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  expanded: boolean;
  disabled: boolean;
  minPrice: string;
  maxPrice: string;
  minimumRating: string;
  minimumSoldCount: string;
  minimumReviewCount: string;
  maxOneStarReviews: string;
  sortBy: string;
  errors: {
    minPrice: string;
    maxPrice: string;
    minimumRating: string;
    minimumSoldCount: string;
    minimumReviewCount: string;
    maxOneStarReviews: string;
  };
}>();

const emit = defineEmits<{
  toggle: [];
  apply: [];
  reset: [];
  'update:minPrice': [value: string];
  'update:maxPrice': [value: string];
  'update:minimumRating': [value: string];
  'update:minimumSoldCount': [value: string];
  'update:minimumReviewCount': [value: string];
  'update:maxOneStarReviews': [value: string];
  'update:sortBy': [value: string];
}>();
</script>

<style scoped>
.advanced-filters {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.advanced-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 22px;
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.advanced-filters__body {
  padding: 0 22px 22px;
  border-top: 1px solid #e7ebf2;
}

.advanced-filters__chevron {
  width: 20px;
  height: 20px;
  color: #66758c;
  transition: transform 0.2s ease;
}

.advanced-filters__chevron--expanded {
  transform: rotate(180deg);
}

.advanced-filters__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 24px;
  padding-top: 22px;
}

.advanced-filters__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-top: 4px;
}

.advanced-filters__actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 17px;
}

.field-group {
  min-width: 0;
}

.field-group--sort {
  width: min(100%, 360px);
}

.field-label {
  display: block;
  margin-bottom: 9px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #c9d3e0;
  border-radius: 12px;
  background: #fff;
  color: #091b36;
  font-size: 15px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.field-select {
  appearance: auto;
}

.field-input:focus {
  outline: none;
  border-color: #9eb6d8;
  box-shadow: 0 0 0 3px rgba(88, 128, 188, 0.12);
}

.field-input:disabled,
.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.field-error {
  display: block;
  min-height: 17px;
  margin-top: 6px;
  color: #b3261e;
  font-size: 12px;
  line-height: 1.4;
  visibility: hidden;
}

.field-error--visible {
  visibility: visible;
}

.primary-button,
.secondary-button {
  height: 42px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: none;
  background: #ff8a65;
  color: #fff;
}

.primary-button:hover:not(:disabled) {
  background: #ff7b58;
}

.secondary-button {
  border: 1px solid #c9d3e0;
  background: #fff;
  color: var(--text);
}

.secondary-button:hover:not(:disabled) {
  background: #f8fafc;
}

@media (max-width: 900px) {
  .advanced-filters__grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .advanced-filters__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .field-group--sort {
    width: 100%;
  }

  .advanced-filters__actions {
    justify-content: flex-end;
    padding-bottom: 0;
  }
}

@media (max-width: 640px) {
  .advanced-filters__header,
  .advanced-filters__body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .advanced-filters__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>
