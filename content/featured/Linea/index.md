---
date: '2'
title: 'Linea'
cover: './recall_img3.png'
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
A real-time collaborative whiteboard (think Excalidraw) where multiple people sketch on an infinite canvas together. Every action — draw, move, edit, delete — is recorded as an operation in an append-only op-log, and that single mechanism powers live multiplayer sync, instant hydration when someone joins a room, undo via compensating operations, and a time-travel slider that replays the board's entire history. Hand-drawn shapes are rendered with Rough.js over the Canvas 2D API, with pan/zoom, selection, and a text tool on top. Built as a Turborepo monorepo with Next.js, TypeScript, an Express HTTP + WebSocket backend, PostgreSQL, and Prisma.