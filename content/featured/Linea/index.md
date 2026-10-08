---
date: '2'
title: 'Linea'
cover: './linea1.png'
github: 'https://github.com/SunnyBagal/Linea'
external: 'https://linea.sunnybagal.com'
tech:
  - React
  - TypeScript
  - Next.js
  - Express
  - WebSocket (ws)
  - PostgreSQL
  - Prisma
  - Zod
  - Turborepo
  - Rough.js
  - Tailwind CSS
  - JWT / argon2id
  - Vercel
  - Railway
---

A real-time collaborative whiteboard (think Excalidraw). Every action is an operation in an append-only op-log with atomic per-room sequence numbers, and that one mechanism drives multiplayer sync, join-time hydration, undo via compensating operations, and a time-travel slider over the board’s history. Moving the hydration fold from quadratic to linear made it ~300× faster; the server sustains ~800 acked ops/sec.
