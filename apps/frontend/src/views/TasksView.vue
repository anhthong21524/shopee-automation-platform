<template>
  <main class="page-shell tasks-page">
    <section class="tasks-hero panel">
      <div>
        <span class="eyebrow">Execution queue</span>
        <h1 class="page-title">Automation task control without the placeholder look.</h1>
        <p class="page-subtitle">
          This screen now reads like the beginning of an operations dashboard, with queue states and
          next actions laid out clearly for the team.
        </p>
      </div>

      <RouterLink to="/search" class="ghost-button">Back to search</RouterLink>
    </section>

    <section class="tasks-grid">
      <article class="panel task-stat">
        <span>Queued</span>
        <strong>08</strong>
        <p>Waiting for available runners or operator confirmation.</p>
      </article>

      <article class="panel task-stat">
        <span>Running</span>
        <strong>03</strong>
        <p>Currently fetching data and syncing downstream task steps.</p>
      </article>

      <article class="panel task-stat">
        <span>Needs review</span>
        <strong>01</strong>
        <p>Flagged for manual validation before retry or publish.</p>
      </article>
    </section>

    <section class="panel queue-preview">
      <div class="queue-preview__header">
        <div>
          <h2 class="section-heading">Task Queue Preview</h2>
          <p class="section-copy">
            Replace this static sample with live data later, but the UI now has clear structure for
            status-driven workflows.
          </p>
        </div>
      </div>

      <div class="queue-list">
        <article v-for="task in taskPreview" :key="task.name" class="queue-item">
          <div>
            <p class="queue-item__label">{{ task.phase }}</p>
            <h3>{{ task.name }}</h3>
            <p class="queue-item__description">{{ task.description }}</p>
          </div>
          <span class="queue-item__status" :data-status="task.statusTone">{{ task.status }}</span>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const taskPreview = [
  {
    phase: 'Product sync',
    name: 'Refresh price watchlist',
    description: 'Re-check tracked product pricing and compare discount deltas against yesterday.',
    status: 'Queued',
    statusTone: 'neutral',
  },
  {
    phase: 'Shop analysis',
    name: 'Validate top-rated sellers',
    description: 'Inspect new high-volume sellers before they are included in the sourcing shortlist.',
    status: 'Running',
    statusTone: 'active',
  },
  {
    phase: 'Exception handling',
    name: 'Resolve blocked listing scraper',
    description: 'Retry the failed crawler after verifying the last response payload and proxy health.',
    status: 'Needs review',
    statusTone: 'warning',
  },
]
</script>

<style scoped>
.tasks-page {
  display: grid;
  gap: 1rem;
}

.tasks-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.task-stat,
.queue-preview {
  padding: 1.35rem;
}

.task-stat span {
  display: inline-block;
  margin-bottom: 0.65rem;
  color: var(--text-soft);
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.task-stat strong {
  display: block;
  margin-bottom: 0.6rem;
  font-size: 2.6rem;
  line-height: 1;
}

.task-stat p,
.queue-item__description {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
}

.queue-list {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.2rem;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border);
}

.queue-item:first-child {
  border-top: none;
  padding-top: 0;
}

.queue-item h3 {
  margin: 0.2rem 0 0.45rem;
  font-size: 1.05rem;
}

.queue-item__label {
  margin: 0;
  color: var(--accent-deep);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.queue-item__status {
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  white-space: nowrap;
}

.queue-item__status[data-status='neutral'] {
  background: var(--surface-muted);
  color: var(--text-soft);
}

.queue-item__status[data-status='active'] {
  background: rgba(255, 183, 77, 0.22);
  color: #9a5400;
}

.queue-item__status[data-status='warning'] {
  background: rgba(238, 77, 45, 0.12);
  color: var(--accent-deep);
}

@media (max-width: 900px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .tasks-hero,
  .queue-item {
    flex-direction: column;
  }
}
</style>
