<template>
  <section class="state-card" role="alert">
    <div class="state-icon" aria-hidden="true">!</div>
    <h2>Search failed</h2>
    <p>{{ message }}</p>
    <button type="button" class="retry-button" :disabled="disabled" @click="emit('retry')">
      Retry
    </button>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<style scoped>
.state-card {
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  padding: 3rem 1.5rem;
  border: 1px solid rgba(179, 38, 30, 0.14);
  border-radius: var(--radius-lg);
  background: rgba(255, 244, 242, 0.95);
  text-align: center;
}

.state-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 999px;
  background: rgba(179, 38, 30, 0.12);
  color: #b3261e;
  font-size: 1.8rem;
  font-weight: 800;
}

h2,
p {
  margin: 0;
}

p {
  max-width: 32rem;
  color: #8f261d;
  line-height: 1.6;
}

.retry-button {
  min-height: 44px;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: #b3261e;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.retry-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
