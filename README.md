# Image Background Remover

MVP: Cloudflare Worker proxying remove.bg API. Upload image → return transparent PNG. No storage; in-memory relay.

## Stack
- Cloudflare Worker (TypeScript)
- remove.bg API
- Static frontend (HTML/JS/CSS)

## Quick Start (TBD)
- Deploy worker via wrangler
- Configure secret: REMOVE_BG_KEY
- Frontend calls `/api/remove` with multipart `image`
