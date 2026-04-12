# Architecture

Design documents (located at `E:/Thong-Le/AI/Shopee/`):
- `Shopee Automation Platform_tech_design.docx`
- `Shopee Automation Platform_mvp_spec.docx`
- `Shopee Automation Platform_epics.docx`
- `Shopee Automation Platform_user_stories.docx`

Diagrams (PlantUML, located at `E:/Thong-Le/AI/Shopee/`):
- `Shopee Automation Platform.plantuml` — Unified sequence diagram
- `Shopee Automation Platform - Backend Component Diagram.plantuml`
- `Shopee Automation Platform - System Context Diagram.plantuml`

## System Overview

```
User → Vue Frontend (Vercel)
            ↓ HTTPS/JSON
       NestJS Backend API (Render)
            ↓               ↓
    Crawler Engine     MongoDB Atlas
    (Playwright)
            ↓
         Shopee.vn
```

## Backend Modules

| Module | Responsibility |
|---|---|
| `SearchModule` | Orchestrates crawl → parse → persist |
| `CrawlerModule` | Playwright browser automation |
| `ParserModule` | Extract ProductCandidate[] from raw HTML |
| `ProductModule` | Mongoose schema + repository |
| `EvaluationModule` | Score products, select top 3 |
| `ContentModule` | Generate Facebook post drafts |
| `AssetModule` | Generate banner metadata |
| `WorkflowModule` | Full pipeline orchestration |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/search` | Crawl keyword, return products |
| POST | `/api/workflows/run` | Full pipeline: crawl → evaluate → generate |

## Data Flow (Workflow)

1. POST `/api/workflows/run` `{ keyword, limit, tone }`
2. `WorkflowOrchestrator.runWorkflow()`
3. `SearchService` → `CrawlerService` → `ParserService` → MongoDB upsert
4. `ProductEvaluationService` → score + select top 3
5. `FacebookPostGeneratorService` → generate post draft
6. `ImageAssetService` → generate banner metadata
7. Return `WorkflowOutput` to frontend

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render (Docker) |
| Database | MongoDB Atlas |
