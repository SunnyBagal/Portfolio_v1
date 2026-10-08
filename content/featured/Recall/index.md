---
date: '4'
title: 'Recall'
cover: './recall_img3.png'
github: 'https://github.com/SunnyBagal/Recall'
external: 'https://recall.sunnybagal.com'
tech:
  - React
  - TypeScript
  - Tailwind CSS
  - Zustand
  - TanStack Query
  - Express
  - PostgreSQL
  - Drizzle ORM
  - pgvector
  - BullMQ
  - Redis
  - Claude API
  - OpenAI API
  - Vercel
  - Railway
---

A link organizer with RAG search over everything you save. URLs (YouTube, Twitter, GitHub, articles) are ingested asynchronously through BullMQ, summarized and embedded, then searched with hybrid retrieval: pgvector HNSW plus Postgres full-text search. Fixing a planner issue that skipped the HNSW index cut vector search latency ~17–20×; moving keyword search from ILIKE to tsvector/GIN took hybrid queries from 28.4 ms to 7.9 ms. Chat answers stream over SSE with citations.
