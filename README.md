# CFG Trade Intake Lite — v4.0
Root-level `pages/` + `lib/` (no src/, no path aliases).

## ENV
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SHOPIFY_STORE_DOMAIN (e.g. cardfather-games.myshopify.com)
- SHOPIFY_ADMIN_TOKEN
- NEXT_PUBLIC_SITE_URL (https://your-vercel-url)

## Routes
- `/` — Queue (Open / In Progress / Ready)
- `/new` — New Intake form
- `/t/[slug]` — Ticket view (values, mark READY, payout Cash/Credit)
- `/credits` — Redeem store credit
- `/search` — Search across name/phone/email/intake/sortswift
- `/tv` — Now Serving screen

## API
- `GET/POST /api/trades`
- `GET/PATCH /api/trades/[id]`
- `POST /api/trades/[id]/ready`
- `POST /api/trades/[id]/pay_cash`
- `POST /api/trades/[id]/pay_credit`
- `GET /api/tickets/[slug]`
- `POST /api/credits/redeem`
- `GET /api/search`

## DB
Run `supabase/schema.sql` in your project.
