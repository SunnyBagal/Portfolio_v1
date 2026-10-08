---
date: '3'
title: 'GeoGrid'
cover: './5.png'
github: 'https://github.com/SunnyBagal/GeoGrid'
tech:
  - Next.js
  - React
  - TypeScript
  - Node.js
  - Express
  - PostgreSQL
  - Redis
  - BullMQ
---

A geospatial lead-generation platform for sales teams: pick an area and a business category, get an exportable list of local businesses with contact data. Map data sources cap results per query, so the search area is recursively subdivided into grid cells, results are filtered against the real boundary polygon (Nominatim + ray-casting point-in-polygon), and cells are cached in Redis. Enrichment runs asynchronously through BullMQ. Built during my internship at InteleCorp, where I led a 4-engineer team as Technical Head (Intern). Company IP, so no public code or demo.
