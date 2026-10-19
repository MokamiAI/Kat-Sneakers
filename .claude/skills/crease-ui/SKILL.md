---
name: crease-ui
description: Visual design system for the crease. sneaker store, a professional, affordable South African sneaker shop for every age. Use whenever building or changing any storefront or admin UI (pages, components, Tailwind classes, shadcn theming, emails) so everything stays consistent.
---

# crease. UI

The look: **a professional sneaker store for everyone, at prices that make sense.** Clean white
retail layout, real product photos, bold type, yellow price tags. Think established sneaker
retailer, not boutique.
Reference designs: https://claude.ai/artifact/9xXD5p1Q8ZN6QLvwDuy9Wn

## Tokens (put in `src/styles/globals.css`, map into Tailwind + shadcn)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page ground |
| `--surface` | `#F4F4F2` | Product image tiles, search field, info panels, checkout ground |
| `--ink` | `#111111` | Text, primary buttons, top bar, footer |
| `--muted` | `#5E5E5A` | Secondary text, brand labels |
| `--line` | `#E4E4E0` | Borders, dividers |
| `--price` | `#FFD23F` | Price tags, "From R499" sticker, active budget chip. Always ink text on it. |
| `--sale` | `#D92D20` | Sale tags, "Sale" nav link, logo dot. Only for sale/discount. |
| `--danger` | `#B42318` | Form errors |

Dark mode: ground `#111111`, surface `#1C1C1B`, ink `#FFFFFF`, muted `#A3A39E`, line `#2E2E2C`; price and sale stay.

## Type

- **Geist** 800–900 for headings with tight tracking (`-0.05em` to `-0.06em`); 400–700 for UI and body.
- **Geist Mono** 500–600 for brand labels (uppercase), small tags, ticker bar.
- Scale: 88 / 64 / 44 / 36 / 28 / 20 / 16 / 15 / 13 / 11.
- Wordmark: `crease` in Geist 900 lowercase + sale-red `.`

## Layout and components

- Container max 1360px, 32px gutter (16px on phones). Sections 88px apart.
- Radius: 28px hero/banners, 20px product tiles, 12–16px inputs and size buttons, pills for buttons and chips.
- **Header:** black ticker bar (free delivery, lay-by & pay in 4, exchanges) → logo, nav (New in, Men, Women, Kids, Brands, Sale in red), wide search field, Sign in, black Bag pill.
- **Product card:** square photo on `--surface`, optional tag (red for % off, white otherwise), uppercase brand in mono, name, yellow price tag + struck-through was-price, "or 4 × Rxx" line.
- **Shop by who:** Kids (UK 10K–2), Teens (UK 3–7), Women, Men, Comfort & wide fit — photo tiles with a white label card.
- **Shop by brand:** bordered tiles with the brand name set in type (no logos unless supplied by the brand).
- **Product page:** large gallery, yellow price, Pay in 4 + Lay-by tiles, colour swatches as photo thumbnails, **Adults / Kids size toggle**, fit note, delivery/pickup/exchange/authenticity panel.
- **Checkout:** grey ground, white step cards (Contact → Address → Delivery → Payment), payment options Card, Instant EFT, Pay in 4, Lay-by with live amounts.
- **Mobile:** sticky bottom bar with price + Add to bag; full-screen menu with Comfort & wide fit and red Sale.

## Admin area

- Shell: dark ink sidebar (Dashboard, Orders with "N to check" badge, Products with low-stock count, Lay-bys, Customers, Settings), content on `--surface` grey, white cards (18px radius).
- Order status pills (always text + colour): Awaiting payment `#EDEDEA/#3A3A37` · Proof to check `#FFE58A/#5C3D00` · Paid, to pack `#DCE8FF/#1E3A8A` · Packed `#E9E0FF/#4C1D95` · Shipped `#D7F2EF/#115E59` · Delivered `#DDF3E2/#166534` · Proof rejected `#FDE2E0/#B42318` · Cancelled `#EDEDEA/#6B6B66`.
- Order detail is one guided task at a time: check proof → pack (checklist) → ship (courier + tracking). Approve stays disabled until "I've seen the money in the bank" is ticked.
- Every customer-facing action shows the WhatsApp/email message it will send before it's sent.
- Stock grids: per-size cells, yellow for low (≤2), red for sold out.
- No payment gateway in v1: customers pay by EFT and upload proof; no card, instant EFT or pay-in-4 options at checkout until a provider is added.

## Photography

- Use supplier/brand product shots for live listings; consistent light-grey or white backgrounds.
- Mockup photos live in `public/images/sneakers/` (Unsplash License, credits in `CREDITS.md`).
- Show every age: include kids' and comfort styles in hero rails, not only adult fashion pairs.

## Affordable + South African (always visible)

- Yellow price tags everywhere; "From R499" sticker in the hero; shop-by-budget tiles (Under R500 / R1k / R1.5k / Sale).
- Pay in 4 and lay-by (20% down, up to 3 months, ship when paid) on cards, product page, checkout, ticker.
- Delivery: all 9 provinces, city delivery times, pickup points, WhatsApp order updates.
- Prices in ZAR incl. VAT, space thousands: `R1 799`. Footer: "Proudly South African".

## Rules

- Professional and neutral: no founder/gender positioning, no pastel theming, no slang in headings.
- Yellow means price, red means sale. Nothing else uses them.
- No gradients, no emoji, no Inter/Roboto/Arial.
- Touch targets ≥ 44px; visible focus ring (`2px solid var(--ink)`, offset 3px); real `<button>`/`<a>`/`<label>`.
