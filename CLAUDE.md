# Shopee Automation Platform

Monorepo: pnpm workspaces + Turbo. Vue 3 frontend, NestJS + Playwright backend, MongoDB Atlas.

## Commands

```bash
# Install (pnpm only — never npm or yarn)
pnpm install

# Development
pnpm dev                                    # Start all apps
pnpm dev --filter=@shopee-automation/backend
pnpm dev --filter=@shopee-automation/frontend

# Build (Turbo handles dependency order automatically)
pnpm build
pnpm build --filter=@shopee-automation/backend

# Type-check (run after any code changes)
pnpm --filter=@shopee-automation/backend exec tsc --noEmit
pnpm --filter=@shopee-automation/frontend exec vue-tsc --noEmit
pnpm --filter=@shopee-automation/shared exec tsc --noEmit

# Lint
pnpm lint

# Test
pnpm test
pnpm test --filter=@shopee-automation/backend
```

## Architecture

```
apps/backend/src/modules/
├── search/      # SearchController → SearchService → Crawler → Parser → DB
├── crawler/     # CrawlerService (Playwright, headless Chromium)
├── parser/      # ParserService (DOM → ProductCandidate[])
├── product/     # Mongoose schema + ProductRepository
├── evaluation/  # ProductEvaluationService (score + top 3)
├── content/     # FacebookPostGeneratorService
├── asset/       # ImageAssetService (banner metadata)
└── workflow/    # WorkflowOrchestrator + WorkflowController (full pipeline)

packages/shared/src/
├── types/       # ProductCandidate, ScoredProduct, BannerResult, WorkflowOutput
└── dto/         # SearchRequest/Response, WorkflowRequest (plain interfaces)
```

API:
- `POST /api/search` — crawl keyword, return products
- `POST /api/workflows/run` — full pipeline: crawl → evaluate → generate post + banner

## Code style

- TypeScript strict mode everywhere
- NestJS modules: one folder per module, index barrel if needed
- Shared package contains **only plain interfaces/types** — no NestJS decorators
- Backend DTOs (with class-validator) live in `apps/backend/src/modules/<name>/dto/`
- Import shared types via `@shopee-automation/shared` (path alias configured in all tsconfigs)

## Environment

Copy `apps/backend/.env.example` → `apps/backend/.env` and fill in `MONGODB_URI`.

Required:
- `MONGODB_URI` — MongoDB Atlas connection string
- `PORT` — defaults to `3001`

## Gotchas

- Use `pnpm` only — workspace symlinks break with npm/yarn
- `@shopee-automation/shared` is consumed as TypeScript source (no pre-build needed in dev)
- Playwright uses system Chromium in Docker; locally it downloads its own browsers
- NestJS backend uses CommonJS; shared package tsconfig compiles to CommonJS for compatibility
- `turbo.json` `"dependsOn": ["^build"]` ensures shared builds before backend/frontend in CI
