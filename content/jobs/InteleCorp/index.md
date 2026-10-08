---
date: '27-03-2026'
title: 'Software Dev Intern'
company: 'InteleCorp Software Ltd'
location: 'Navi Mumbai, In'
range: 'Jan - April 2026'
url: 'https://www.intelebiz.com/'
---

- Led a four-person intern team building GeoGrid, a geospatial lead-generation platform for the company’s sales team. Owned the architecture and integrated everyone’s work behind one API.
- Designed recursive grid subdivision to get past per-query result caps: any cell that hits the cap is split into smaller cells, then results are merged and deduplicated.
- Replaced square bounding boxes with real city boundaries (Nominatim polygons plus ray-casting point-in-polygon), so only cells inside the boundary are processed. Cached grid cells in Redis.
- Moved extraction and enrichment onto a BullMQ queue so scans run in the background, and added Stripe checkout for paid plans.
- Handed the system over to the company’s senior developers at the end of the internship.
