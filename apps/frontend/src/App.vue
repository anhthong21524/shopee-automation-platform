<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar__inner">
        <RouterLink to="/" class="brand">
          <span class="brand__badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 8V6.75A5 5 0 0 1 12 2a5 5 0 0 1 5 4.75V8h1.25A1.75 1.75 0 0 1 20 9.75v8.5A3.75 3.75 0 0 1 16.25 22h-8.5A3.75 3.75 0 0 1 4 18.25v-8.5A1.75 1.75 0 0 1 5.75 8H7Zm1.5 0h7V6.75a3.5 3.5 0 0 0-7 0V8Zm-2.75 1.5a.25.25 0 0 0-.25.25v8.5c0 1.243 1.007 2.25 2.25 2.25h8.5c1.243 0 2.25-1.007 2.25-2.25v-8.5a.25.25 0 0 0-.25-.25H5.75Zm8 2a.75.75 0 0 1 .75.75 2.5 2.5 0 1 1-5 0 .75.75 0 0 1 1.5 0 1 1 0 1 0 2 0 .75.75 0 0 1 .75-.75Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <strong>Shopee Automation</strong>
        </RouterLink>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
:root {
  color-scheme: light;
  --bg: #f6f8fc;
  --surface: #ffffff;
  --border: #d9e1ec;
  --text: #0f2850;
  --text-soft: #73839a;
  --accent: #f8562c;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 2px 8px rgba(16, 24, 40, 0.08);
  --radius-lg: 14px;
  --radius-md: 12px;
  --container: 1160px;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, "Segoe UI", sans-serif;
  color: var(--text);
  background: var(--bg);
}

a {
  color: inherit;
}

button,
input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  height: 85px;
  background: var(--surface);
  border-bottom: 1px solid #e7ebf2;
}

.topbar__inner {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: var(--text);
}

.brand__badge {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
}

.brand__badge svg {
  width: 22px;
  height: 22px;
}

.brand strong {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.page-shell {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px 48px;
}

@media (max-width: 820px) {
  .topbar__inner {
    padding: 0 20px;
  }
}

@media (max-width: 640px) {
  .page-shell {
    padding: 0 16px 32px;
  }

  .topbar {
    height: 72px;
  }

  .topbar__inner {
    padding: 0 16px;
  }
}
</style>
