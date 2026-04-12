<template>
  <main class="page-shell search-page">
    <section class="search-card">
      <SearchForm
        :keyword="keyword"
        :limit="limit"
        :keyword-error="displayKeywordError"
        :disabled="isLoading"
        :is-loading="isLoading"
        :can-submit="canSubmit"
        @update:keyword="handleKeywordChange"
        @update:limit="handleLimitChange"
        @submit="handleSubmit"
        @blur:keyword="keywordTouched = true"
      />
    </section>

    <section class="advanced-filters-section">
      <AdvancedFiltersPanel
        :expanded="isAdvancedFiltersExpanded"
        :disabled="isLoading"
        :min-price="minPrice"
        :max-price="maxPrice"
        :minimum-rating="minimumRating"
        :minimum-sold-count="minimumSoldCount"
        :minimum-review-count="minimumReviewCount"
        :max-one-star-reviews="maxOneStarReviews"
        :sort-by="sortBy"
        :errors="advancedFilterErrors"
        @toggle="isAdvancedFiltersExpanded = !isAdvancedFiltersExpanded"
        @update:min-price="handleMinPriceChange"
        @update:max-price="handleMaxPriceChange"
        @update:minimum-rating="minimumRating = $event"
        @update:minimum-sold-count="minimumSoldCount = $event"
        @update:minimum-review-count="minimumReviewCount = $event"
        @update:max-one-star-reviews="maxOneStarReviews = $event"
        @update:sort-by="sortBy = $event"
        @reset="resetAdvancedFilters"
        @apply="handleAdvancedFiltersApply"
      />
    </section>

    <section class="results-section">
      <ProductList
        v-if="status === 'success' && result"
        :keyword="result.keyword"
        :total="result.total"
        :products="result.products"
      />
      <LoadingState
        v-else-if="status === 'loading'"
        title="Searching products"
        description="Please wait while we fetch matching Shopee listings. This can take up to 60 seconds."
      />
      <ErrorState v-else-if="status === 'error'" :message="errorMessage" @retry="retry" />
      <EmptyState
        v-else-if="status === 'empty'"
        title="No products found"
        description="Try another keyword or increase the limit and search again."
      />
      <EmptyState
        v-else
        title="Ready to search"
        description="Enter a keyword above to start searching for products"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AdvancedFiltersPanel from '@/components/search/AdvancedFiltersPanel.vue';
import EmptyState from '@/components/search/EmptyState.vue';
import ErrorState from '@/components/search/ErrorState.vue';
import LoadingState from '@/components/search/LoadingState.vue';
import ProductList from '@/components/search/ProductList.vue';
import SearchForm from '@/components/search/SearchForm.vue';
import { useSearch } from '@/composables/useSearch';

const DEFAULT_LIMIT = 6;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

const keyword = ref('');
const limit = ref(DEFAULT_LIMIT);
const keywordTouched = ref(false);
const hasSubmitted = ref(false);
const isAdvancedFiltersExpanded = ref(false);
const minPrice = ref('');
const maxPrice = ref('');
const minimumRating = ref('');
const minimumSoldCount = ref('');
const minimumReviewCount = ref('');
const maxOneStarReviews = ref('');
const sortBy = ref('default');

const { status, result, errorMessage, search, retry } = useSearch();

const trimmedKeyword = computed(() => keyword.value.trim());
const keywordError = computed(() =>
  trimmedKeyword.value.length === 0 ? 'Keyword is required.' : '',
);
const displayKeywordError = computed(() =>
  keywordTouched.value || hasSubmitted.value ? keywordError.value : '',
);
const isKeywordValid = computed(() => keywordError.value.length === 0);
const isLoading = computed(() => status.value === 'loading');
const canSubmit = computed(() => isKeywordValid.value && !isLoading.value);
const advancedFilterErrors = computed(() => ({
  minPrice: validateNonNegative(minPrice.value, 'Min price must be at least 0.'),
  maxPrice: validateMaxPrice(maxPrice.value, minPrice.value),
  minimumRating: validateRating(minimumRating.value),
  minimumSoldCount: validateNonNegative(
    minimumSoldCount.value,
    'Minimum sold count must be at least 0.',
  ),
  minimumReviewCount: validateNonNegative(
    minimumReviewCount.value,
    'Minimum review count must be at least 0.',
  ),
  maxOneStarReviews: validateNonNegative(
    maxOneStarReviews.value,
    'Max 1-star reviews must be at least 0.',
  ),
}));
const hasAdvancedFilterErrors = computed(() =>
  Object.values(advancedFilterErrors.value).some((value) => value.length > 0),
);

function handleKeywordChange(value: string): void {
  keyword.value = value;
  keywordTouched.value = true;
}

function handleLimitChange(value: number): void {
  if (!Number.isFinite(value)) {
    limit.value = DEFAULT_LIMIT;
    return;
  }

  if (value < MIN_LIMIT) {
    limit.value = MIN_LIMIT;
    return;
  }

  if (value > MAX_LIMIT) {
    limit.value = MAX_LIMIT;
    return;
  }

  limit.value = Math.trunc(value);
}

async function handleSubmit(): Promise<void> {
  hasSubmitted.value = true;
  keywordTouched.value = true;

  if (!canSubmit.value) {
    return;
  }

  await search(trimmedKeyword.value, normalizeLimit(limit.value));
}

async function handleAdvancedFiltersApply(): Promise<void> {
  hasSubmitted.value = true;
  keywordTouched.value = true;

  if (hasAdvancedFilterErrors.value || !canSubmit.value) {
    return;
  }

  await search(trimmedKeyword.value, normalizeLimit(limit.value));
}

function resetAdvancedFilters(): void {
  minPrice.value = '';
  maxPrice.value = '';
  minimumRating.value = '';
  minimumSoldCount.value = '';
  minimumReviewCount.value = '';
  maxOneStarReviews.value = '';
  sortBy.value = 'default';
}

function normalizeLimit(value: number): number {
  if (!Number.isInteger(value) || value < MIN_LIMIT) {
    return DEFAULT_LIMIT;
  }

  return Math.min(value, MAX_LIMIT);
}

function validateNonNegative(value: string, message: string): string {
  if (value.trim().length === 0) {
    return '';
  }

  const parsedValue = parseNumericInput(value);
  if (parsedValue === null || parsedValue < 0) {
    return message;
  }

  return '';
}

function validateMaxPrice(currentValue: string, minValue: string): string {
  const nonNegativeError = validateNonNegative(currentValue, 'Max price must be at least 0.');
  if (nonNegativeError) {
    return nonNegativeError;
  }

  if (currentValue.trim().length === 0 || minValue.trim().length === 0) {
    return '';
  }

  const parsedCurrentValue = parseNumericInput(currentValue);
  const parsedMinValue = parseNumericInput(minValue);

  if (parsedCurrentValue === null || parsedMinValue === null) {
    return 'Max price must be at least 0.';
  }

  if (parsedMinValue > parsedCurrentValue) {
    return 'Max price must be greater than or equal to min price.';
  }

  return '';
}

function validateRating(value: string): string {
  if (value.trim().length === 0) {
    return '';
  }

  const parsedValue = parseNumericInput(value);
  if (parsedValue === null || parsedValue < 0 || parsedValue > 5) {
    return 'Minimum rating must be between 0 and 5.';
  }

  return '';
}

function parseNumericInput(value: string): number | null {
  const normalizedValue = value.replace(/[^\d.-]/g, '');
  if (normalizedValue.length === 0) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatCurrencyInput(value: string): string {
  const numericValue = parseNumericInput(value);
  if (numericValue === null) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.trunc(numericValue));
}

function handleMinPriceChange(value: string): void {
  minPrice.value = formatCurrencyInput(value);
}

function handleMaxPriceChange(value: string): void {
  maxPrice.value = formatCurrencyInput(value);
}
</script>

<style scoped>
.search-page {
  padding-top: 28px;
}

.search-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.advanced-filters-section {
  margin-top: 12px;
}

.results-section {
  min-height: 420px;
  margin-top: 12px;
}

@media (max-width: 640px) {
  .advanced-filters-section {
    margin-top: 10px;
  }

  .results-section {
    margin-top: 10px;
  }
}

@media (max-width: 900px) {
  .search-page {
    padding-top: 20px;
  }
}
</style>
