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

function normalizeLimit(value: number): number {
  if (!Number.isInteger(value) || value < MIN_LIMIT) {
    return DEFAULT_LIMIT;
  }

  return Math.min(value, MAX_LIMIT);
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

.results-section {
  min-height: 420px;
}

@media (max-width: 900px) {
  .search-page {
    padding-top: 20px;
  }
}
</style>
