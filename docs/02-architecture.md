# Architecture & Project Structure

## 1. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG for SEO on product pages, server actions, one codebase for store + admin |
| UI kit | **shadcn/ui** (Radix primitives) + **Tailwind CSS v4** | Accessible components we own and can restyle into a custom brand, not a template look |
| Motion | **Motion** (Framer Motion) | Cart drawer, image transitions, micro-interactions |
| Carousel | **Embla** (via shadcn Carousel) | Product galleries, rails |
| Forms | **React Hook Form + Zod** | Typed validation shared between client and server |
| Database | **PostgreSQL on Supabase** | Managed Postgres + auth + image storage in one place |
| ORM | **Drizzle ORM** | Type-safe schema in TS, lightweight, good migrations |
| Auth | **Supabase Auth** (email + Google) | Customers and admin roles |
| Payments | **Manual EFT + proof-of-payment upload** (v1), behind a `PaymentProvider` interface | No gateway yet. Add Paystack / Yoco / PayFast later without touching orders |
| File storage | **Supabase Storage**, private bucket `payment-proofs` | Proofs are personal financial data: signed URLs, admin-only access (POPIA) |
| Messaging | WhatsApp Business (Cloud API) + email | Order placed, reminder, payment confirmed, proof rejected, shipped, cancelled |
| Email | **Resend + React Email** | Order confirmation, shipping updates |
| Search | Postgres full-text first → Algolia/Meilisearch if the catalogue grows | Don't pay for search until we need it |
| Hosting | **Vercel** | Preview deploys per branch, image optimisation |
| Quality | ESLint, Prettier, **Vitest** (unit), **Playwright** (e2e checkout), GitHub Actions CI | Checkout must never break silently |

**Alternative considered:** Shopify (headless or theme). Faster to launch and zero backend work, but
monthly fees + transaction fees and less design freedom. Worth revisiting if the owner wants to
run everything from an existing platform.

## 2. Folder structure

```
sneaker-store/
├─ docs/                          # brief, architecture, decisions
├─ public/                        # static assets, favicons
├─ src/
│  ├─ app/
│  │  ├─ (store)/                 # public storefront (shared header/footer layout)
│  │  │  ├─ page.tsx              # Home
│  │  │  ├─ shop/
│  │  │  │  ├─ page.tsx           # All shoes
│  │  │  │  └─ [category]/page.tsx
│  │  │  ├─ occasion/[slug]/page.tsx
│  │  │  ├─ product/[slug]/page.tsx
│  │  │  ├─ search/page.tsx
│  │  │  ├─ cart/page.tsx
│  │  │  ├─ checkout/page.tsx
│  │  │  ├─ checkout/success/page.tsx
│  │  │  ├─ account/              # orders, addresses, wishlist
│  │  │  └─ (info)/               # about, contact, size-guide, shipping-returns, faq, legal
│  │  ├─ (admin)/admin/           # dashboard, products, orders, discounts (role-guarded)
│  │  ├─ api/webhooks/payments/route.ts
│  │  ├─ layout.tsx
│  │  └─ sitemap.ts / robots.ts
│  ├─ components/
│  │  ├─ ui/                      # shadcn primitives (button, sheet, dialog…)
│  │  ├─ layout/                  # Header, Footer, MobileNav, AnnouncementBar
│  │  ├─ product/                 # ProductCard, Gallery, SizePicker, SwatchPicker, SizeGuide
│  │  ├─ shop/                    # FilterPanel, SortMenu, ActiveFilters
│  │  ├─ cart/                    # CartDrawer, CartLine, CartSummary
│  │  └─ checkout/                # AddressForm, ShippingOptions, OrderSummary
│  ├─ server/
│  │  ├─ db/                      # drizzle schema, client, migrations, seed
│  │  ├─ actions/                 # server actions (cart, checkout, admin)
│  │  └─ queries/                 # read-side data access (products, orders)
│  ├─ lib/
│  │  ├─ payments/                # PaymentProvider interface + paystack impl
│  │  ├─ email/                   # React Email templates
│  │  ├─ validators/              # zod schemas
│  │  └─ utils.ts                 # money formatting, size conversion
│  └─ styles/globals.css          # Tailwind + design tokens
├─ tests/                         # vitest + playwright
├─ drizzle.config.ts
└─ .env.example
```

## 3. Data model (v1)

```
Category ─┐
Occasion ─┼─< ProductTag >─ Product ──< ProductImage
Brand ────┘                    │
                               └──< Variant (colour, size_uk, size_eu, sku, price?, stock)

User ──< Address
User ──< Order ──< OrderItem >── Variant
Order ──< PaymentProof (file, amount_claimed, uploaded_at, status, reviewed_by, reject_reason)
Order ──< OrderEvent (timeline: placed, proof uploaded, approved, packed, shipped…)
Order ──< Shipment (courier, tracking_no, collected_at)
StaffUser (role: owner | packer)
User ──< WishlistItem >── Product
Cart ──< CartItem >── Variant        (cart keyed by cookie for guests, merged on login)
Discount (code, type %, fixed, min spend, expiry, usage limit)
```

Key rules:
- **Stock lives on the variant** (colour × size). PDP greys out sold-out sizes.
- Prices stored as **integer cents** + currency code.
- Order lines snapshot name, size, price at purchase time (product edits don't rewrite history).
- Stock is **reserved** when an order is placed and **committed** when an admin approves payment
  (one transaction). Unpaid orders auto-cancel after the payment window (default 48h) and release stock.
- Order status: `awaiting_payment → proof_uploaded → paid → packed → shipped → delivered`,
  plus `proof_rejected` (back to awaiting a new proof) and `cancelled`.
- Approving payment requires the admin to confirm the money is in the bank account (a proof alone can be faked).
  Flag proofs whose file hash was already used on another order.
- Lay-by orders hold several PaymentProofs (deposit + instalments) and ship when fully paid.
- Packers can pack and ship but cannot approve payments or see bank settings.

## 4. Key flows

1. **Browse → buy:** Home → Shop (filter by age, budget, size) → Product → Add to bag → Checkout →
   **Place order** → bank details + order number as reference → customer pays by EFT → **uploads proof**.
2. **Admin payment check:** Orders › Proof to check → open order → compare proof with bank app →
   Approve (customer notified, stock committed) or Reject with reason (customer asked to re-upload).
3. **Admin fulfilment:** Paid → packing checklist → Packed → courier + tracking → Shipped (customer notified) → Delivered.
4. **Expiry:** no proof within the payment window → reminder → auto-cancel, stock released.

Admin screens (see wireframes A1–A7): Dashboard, Orders, Order detail, Products & stock,
Add/edit product, Settings (bank details, payment rules, delivery, message templates, staff), mobile proof check.
Routes live under `src/app/(admin)/admin/` — `orders`, `orders/[id]`, `products`, `products/[id]`, `settings`.

## 5. Design system — "professional, affordable, for every age"

Full rules live in the project skill `.claude/skills/crease-ui/SKILL.md` (Claude loads it when
building UI). Summary:

- Type: **Geist** (UI + headings, tight tracking) and **Geist Mono** (prices, sizes, labels).
- Colour: white ground, ink `#111111`, light-grey tiles `#F4F4F2`, yellow price tag `#FFD23F`, sale red `#D92D20`.
- Real product photography on light-grey tiles, 20px rounded corners.
- Navigation by who: Men, Women, Kids, Teens, Comfort & wide fit; plus Brands and Sale.
- Pages beyond the storefront: Sign in / Join (family sizes), Brands, Size guide, Lay-by info.
- Pill buttons, generous whitespace, no heavy shadows.
- Tokens in `globals.css` as CSS variables, consumed by Tailwind and shadcn.

## 6. Delivery roadmap

| Phase | Output |
|-------|--------|
| 0 — Foundations | Brief signed off, wireframes, visual design, repo + CI scaffold |
| 1 — Catalogue | DB schema, seed data, Home, PLP with filters, PDP |
| 2 — Commerce | Cart, checkout, payments + webhook, order emails |
| 3 — Accounts & Admin | Customer account, admin products/stock/orders |
| 4 — Launch | SEO, analytics, accessibility + performance pass, content, go live |
| 5 — Growth (v2) | Reviews, loyalty, abandoned-cart email, wishlists sharing |
