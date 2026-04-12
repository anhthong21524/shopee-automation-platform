<template>
  <section class="state-card" data-testid="loading" aria-live="polite">
    <div class="state-card__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M12 3a9 9 0 1 1-9 9"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
        />
      </svg>
    </div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'Searching products',
    description: 'The crawler is running. This can take up to 60 seconds.',
  },
);
</script>

<style scoped>
.state-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding-top: 140px;
  text-align: center;
}

.state-card__icon {
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  border-radius: 999px;
  background: #f2f4f8;
  color: #8f9bb0;
}

.state-card__icon svg {
  width: 39px;
  height: 39px;
  animation: spin 0.8s linear infinite;
}

h2,
p {
  margin: 0;
}

h2 {
  color: #071a37;
  font-size: 18px;
  font-weight: 700;
}

p {
  color: var(--text-soft);
  font-size: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .state-card {
    padding-top: 72px;
  }
}
</style>
