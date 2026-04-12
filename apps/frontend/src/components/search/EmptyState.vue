<template>
  <section class="state-card">
    <div class="state-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm8.03 11.97 2.25 2.25a.75.75 0 1 1-1.06 1.06l-2.25-2.25a.75.75 0 0 1 1.06-1.06Z"
          fill="currentColor"
        />
      </svg>
    </div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<style scoped>
.state-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding-top: 140px;
  text-align: center;
}

.state-icon {
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  border-radius: 999px;
  background: #f2f4f8;
  color: #8f9bb0;
}

.state-icon svg {
  width: 39px;
  height: 39px;
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

@media (max-width: 900px) {
  .state-card {
    padding-top: 72px;
  }
}
</style>
