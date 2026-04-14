# Shopee Automation Platform

Automated platform for crawling Shopee products, evaluating top items, and generating Facebook marketing content.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite + TypeScript |
| Backend | NestJS + TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Browser Automation | Playwright (headless Chromium) |
| Monorepo | pnpm workspaces + Turbo |

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` and set:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopee-automation
PORT=3001
# Optional fallback if Shopee blocks anonymous headless crawling
SHOPEE_COOKIES=[{"name":"SPC_EC","value":"YOUR_VALUE","domain":".shopee.vn","path":"/"}]
```

### 3. Start the application

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev --filter=@shopee-automation/backend
pnpm dev --filter=@shopee-automation/frontend
```

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Search page | http://localhost:3000/search |
| Backend API | http://localhost:3001/api |

---

## Project Structure

```
shopee-automation-platform/
├── apps/
│   ├── backend/                  # NestJS API server
│   │   └── src/modules/
│   │       ├── search/           # POST /api/search
│   │       ├── crawler/          # Playwright-based Shopee scraper
│   │       ├── parser/           # HTML → ProductCandidate[]
│   │       ├── product/          # Mongoose schema + repository
│   │       ├── evaluation/       # Scoring engine (top 3 selection)
│   │       ├── content/          # Facebook post generator
│   │       ├── asset/            # Banner metadata builder
│   │       └── workflow/         # POST /api/workflows/run (full pipeline)
│   └── frontend/                 # Vue 3 + Vite SPA
│       └── src/
│           ├── api/              # Axios API clients
│           ├── composables/      # Reusable Vue composables
│           └── views/            # Page components
└── packages/
    └── shared/                   # Shared TypeScript types and interfaces
```

---

## API Reference

### `POST /api/search`

Crawl Shopee for a keyword and return matching products.

**Request**
```json
{
  "keyword": "iPhone 15",
  "limit": 20
}
```

**Response**
```json
{
  "keyword": "iPhone 15",
  "total": 20,
  "products": [
    {
      "keyword": "iPhone 15",
      "title": "iPhone 15 Pro Max 256GB",
      "url": "https://shopee.vn/...",
      "imageUrl": "https://...",
      "price": 29000000,
      "originalPrice": 32000000,
      "discountPercent": 9,
      "rating": 4.8,
      "soldCount": 1200,
      "shopName": "Apple Official Store"
    }
  ]
}
```

### `POST /api/workflows/run`

Run the full pipeline: crawl → evaluate → generate Facebook post + banner.

**Request**
```json
{
  "keyword": "iPhone 15",
  "limit": 20,
  "tone": "ban-hang"
}
```

> `tone` options: `ban-hang` (sales), `review` (review), `tu-mo` (personal find)

---

## Development

### Type-check

```bash
pnpm --filter=@shopee-automation/backend exec tsc --noEmit
pnpm --filter=@shopee-automation/frontend exec vue-tsc --noEmit
```

### Lint

```bash
pnpm lint
```

### Test

```bash
# All
pnpm test

# Backend (Jest)
pnpm test --filter=@shopee-automation/backend

# Frontend (Vitest)
pnpm test --filter=@shopee-automation/frontend
```

### Build

```bash
pnpm build
```

---

## Features

- **US1.1 — Product Search**: Enter a keyword, set a result limit, and retrieve a live product list from Shopee with loading and error states.
- **Workflow pipeline**: One-click full pipeline from keyword to Facebook-ready post and banner metadata.
