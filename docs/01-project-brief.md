# Project Brief — Online Shoe Store

> This is the refined version of the original request. Treat it as the source of truth for scope;
> update it when decisions change. Open questions are marked **[DECIDE]**.

## 1. The ask (rewritten)

Build a modern, mobile-first e-commerce website for an independent **sneaker** retailer
(semi-formal shoes may be added later as a separate category). The store must let customers discover
pairs by style and brand, filter by their size, view rich product detail, and pay securely online.
The owner must be able to manage products, stock (per size), and orders without touching code.

The brand feel: **a professional, affordable South African sneaker store for every age** — kids,
teens, women, men and comfort / wide fit for older customers. Working name **crease.**
Clean white retail look, real product photography, yellow price tags, red only for sales.
Top brands: Nike, adidas, Puma, Converse, New Balance, Vans **[DECIDE: confirm stocked brands]**.
See the wireframes: https://claude.ai/artifact/9xXD5p1Q8ZN6QLvwDuy9Wn

## 2. Goals

| # | Goal | How we'll know |
|---|------|----------------|
| 1 | Customers find a shoe in their size fast | Size filter on every listing; ≤3 clicks home → PDP |
| 2 | Convert on mobile | Mobile Lighthouse ≥90 perf; sticky add-to-cart; one-page checkout |
| 3 | Owner runs the shop alone | Admin to add products, set stock per size, fulfil orders |
| 4 | Fewer size-related returns | Size guide + fit notes on every product |

## 3. Users

- **Shopper** — browses on phone, knows their size, cares about price, stock and delivery time.
- **Returning customer** — wants order history, saved addresses, wishlist.
- **Owner / staff** — adds stock, edits prices, ships orders, runs promotions.

## 4. Product range & catalogue structure

- **Styles:** Lifestyle · Running · Retro · Basketball · Skate · Slides **[DECIDE: final list]**
- **Brands:** **[DECIDE: which brands are stocked]**
- **Audience:** every age — Kids (UK 10K–2) · Teens (UK 3–7) · Women · Men · Comfort & wide fit
- **Product attributes:** brand, colourway, material (leather, suede, mesh, knit, canvas),
  fit note (runs small / true / large), sizes (UK/EU/US), price, compare-at price, drop date.
- **Variants:** one product → many variants (colour × size), each with its own SKU and stock.

## 5. Scope — MVP (v1)

**Storefront**
- Home: hero, shop-by-category, shop-by-occasion, new arrivals, best sellers, trust strip.
- Listing (PLP): filters (size, category, occasion, brand, colour, price), sort, pagination.
- Product (PDP): gallery, colourway swatches, size picker with live stock, size guide, fit note,
  delivery/returns info, related products.
- Cart (slide-out drawer + page), promo codes.
- Checkout: guest or account, delivery address, courier / express / pickup point, payment by
  card, instant EFT, pay in 4 or **lay-by** (20% deposit, up to 3 months, ship when paid).
- Affordability everywhere: shop-by-budget (under R500 / R1k / R1.5k), was/now prices, free
  delivery threshold (sample: R999). **[DECIDE: real threshold and lay-by terms]**
- Search with instant results.
- Account: orders, addresses, wishlist.
- Static pages: About, Contact, Shipping & Returns, Size Guide, FAQ, Terms, Privacy.

**Admin**
- Products & variants CRUD with image upload; stock per size.
- Orders: list, status (paid → packed → shipped → delivered), refunds.
- Discount codes; basic sales dashboard.

**Out of scope for v1:** marketplace/multi-vendor, loyalty points, product reviews (v2),
multi-currency, native apps.

## 6. Non-functional requirements

- Mobile-first, responsive down to 360px.
- Accessibility: WCAG 2.2 AA (keyboard, contrast, labelled controls).
- Performance: Core Web Vitals green; optimised images (AVIF/WebP).
- SEO: server-rendered product pages, structured data (`Product`, `Offer`), sitemap.
- Security: payments handled by the provider (no card data touches our server), webhook signature
  verification, rate-limited auth.
- POPIA/GDPR-friendly: cookie notice, privacy policy, data export/delete on request.

## 7. Open questions for the owner

1. **[DECIDE]** Store name, logo, brand colours?
2. **[DECIDE]** Country & currency (assumed **South Africa / ZAR** — confirm).
3. **[DECIDE]** Payment provider: Paystack, Yoco, PayFast, or Stripe.
4. **[DECIDE]** Delivery: courier partner, flat rate vs. calculated, free-delivery threshold, click & collect?
5. **[DECIDE]** Roughly how many products / SKUs at launch?
6. **[DECIDE]** Returns & exchanges policy (size exchanges are the big one for shoes).
7. **[DECIDE]** Who supplies product photography?
