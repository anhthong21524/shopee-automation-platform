<template>
  <form class="search-form" novalidate @submit.prevent="emit('submit')">
    <label class="field-label field-label--keyword" for="keyword">
      Search Keyword <span aria-hidden="true">*</span>
    </label>
    <label class="field-label field-label--limit" for="limit">Limit</label>

    <input
      id="keyword"
      class="field-input field-input--keyword"
      :value="keyword"
      type="text"
      placeholder="e.g. iPhone 15"
      autocomplete="off"
      :disabled="disabled"
      :aria-invalid="Boolean(keywordError)"
      :aria-describedby="keywordError ? 'keyword-error' : undefined"
      @input="handleKeywordInput"
      @blur="emit('blur:keyword')"
    />

    <input
      id="limit"
      class="field-input field-input--limit"
      :value="limit"
      type="number"
      min="1"
      max="100"
      :disabled="disabled"
      @input="handleLimitInput"
    />

    <button type="submit" class="submit-button" :disabled="!canSubmit">
      <svg v-if="isLoading" class="submit-button__spinner" viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.3"
          stroke-width="2.5"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2.5"
        />
      </svg>
      <svg v-else class="submit-button__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm8.03 11.97 2.25 2.25a.75.75 0 1 1-1.06 1.06l-2.25-2.25a.75.75 0 0 1 1.06-1.06Z"
          fill="currentColor"
        />
      </svg>
      <span>{{ isLoading ? 'Searching...' : 'Search' }}</span>
    </button>

    <span
      id="keyword-error"
      class="field-error"
      :class="{ 'field-error--visible': Boolean(keywordError) }"
      :role="keywordError ? 'alert' : undefined"
      :aria-hidden="keywordError ? 'false' : 'true'"
    >
      {{ keywordError }}
    </span>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  keyword: string;
  limit: number;
  keywordError: string;
  disabled: boolean;
  isLoading: boolean;
  canSubmit: boolean;
}>();

const emit = defineEmits<{
  'update:keyword': [value: string];
  'update:limit': [value: number];
  submit: [];
  'blur:keyword': [];
}>();

function handleKeywordInput(event: Event): void {
  emit('update:keyword', (event.target as HTMLInputElement).value);
}

function handleLimitInput(event: Event): void {
  emit('update:limit', Number((event.target as HTMLInputElement).value));
}
</script>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: minmax(0, 560px) 104px 128px;
  grid-template-areas:
    'keyword-label limit-label .'
    'keyword-input limit-input button'
    'keyword-error . .';
  column-gap: 16px;
  row-gap: 9px;
  padding: 24px 22px 22px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.field-label--keyword {
  grid-area: keyword-label;
}

.field-label--limit {
  grid-area: limit-label;
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

.field-input--keyword {
  grid-area: keyword-input;
  min-width: 0;
}

.field-input--limit {
  grid-area: limit-input;
}

.field-input:focus {
  outline: none;
  border-color: #9eb6d8;
  box-shadow: 0 0 0 3px rgba(88, 128, 188, 0.12);
}

.field-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.field-error {
  grid-area: keyword-error;
  color: #b3261e;
  font-size: 12px;
  line-height: 1.4;
  min-height: 17px;
  visibility: hidden;
}

.field-error--visible {
  visibility: visible;
}

.submit-button {
  grid-area: button;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  align-self: center;
  border: none;
  border-radius: 12px;
  background: #ff8a65;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: #ff7b58;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button__icon,
.submit-button__spinner {
  width: 16px;
  height: 16px;
}

.submit-button__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .search-form {
    grid-template-columns: 1fr;
    grid-template-areas:
      'keyword-label'
      'keyword-input'
      'keyword-error'
      'limit-label'
      'limit-input'
      'button';
    row-gap: 12px;
  }

  .field-error {
    min-height: 0;
  }
}
</style>
