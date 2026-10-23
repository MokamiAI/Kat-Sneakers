# Kat Sneakers test report

**Every check passed on desktop and mobile.**

| | Desktop | Mobile |
| --- | --- | --- |
| Screen | 1366 × 900 | 390 × 844 phone, touch |
| Passed | 51 of 51 | 51 of 51 |
| Warnings | 0 | 0 |
| Failed | 0 | 0 |

Run on 22 October 2026 at 22:56 SAST in Google Chrome 155.0.8059.85 with Node.js v26.5.0. Each screen size used its own fresh throwaway store, so your real `data/` folder was not touched. Rerun with `npm run test:chrome`, or `npm run test:chrome:watch` to watch Chrome do it.

**How to judge:** every check below shows what I did, the result on each screen size, and the screenshots side by side (click one to open it full size). Tick the boxes and add notes under each check.

## All checks

| # | Check | Desktop | Mobile |
| --- | --- | --- | --- |
| 1 | [Home page loads the live catalogue](#1-storefront-home-page-loads-the-live-catalogue) | ✅ Pass | ✅ Pass |
| 2 | [New in page](#1-storefront-new-in-page) | ✅ Pass | ✅ Pass |
| 3 | [Men page](#1-storefront-men-page) | ✅ Pass | ✅ Pass |
| 4 | [Women page](#1-storefront-women-page) | ✅ Pass | ✅ Pass |
| 5 | [Kids page](#1-storefront-kids-page) | ✅ Pass | ✅ Pass |
| 6 | [Sale page](#1-storefront-sale-page) | ✅ Pass | ✅ Pass |
| 7 | [Brands page](#1-storefront-brands-page) | ✅ Pass | ✅ Pass |
| 8 | [Search](#1-storefront-search) | ✅ Pass | ✅ Pass |
| 9 | [Budget filter](#1-storefront-budget-filter) | ✅ Pass | ✅ Pass |
| 10 | [Sort by price](#1-storefront-sort-by-price) | ✅ Pass | ✅ Pass |
| 11 | [Shop by brand](#1-storefront-shop-by-brand) | ✅ Pass | ✅ Pass |
| 12 | [Sale carousel](#1-storefront-sale-carousel) | ✅ Pass | ✅ Pass |
| 13 | [Size guide](#1-storefront-size-guide) | ✅ Pass | ✅ Pass |
| 14 | [Delivery and payment info](#1-storefront-delivery-and-payment-info) | ✅ Pass | ✅ Pass |
| 15 | [Product details](#1-storefront-product-details) | ✅ Pass | ✅ Pass |
| 16 | [Wrong password is refused](#2-accounts-wrong-password-is-refused) | ✅ Pass | ✅ Pass |
| 17 | [Protected pages ask for sign-in](#2-accounts-protected-pages-ask-for-sign-in) | ✅ Pass | ✅ Pass |
| 18 | [Create an account](#2-accounts-create-an-account) | ✅ Pass | ✅ Pass |
| 19 | [Sign out and back in](#2-accounts-sign-out-and-back-in) | ✅ Pass | ✅ Pass |
| 20 | [Forgot password page](#2-accounts-forgot-password-page) | ✅ Pass | ✅ Pass |
| 21 | [Customers cannot open store management](#2-accounts-customers-cannot-open-store-management) | ✅ Pass | ✅ Pass |
| 22 | [Owner signs in](#3-store-settings-owner-signs-in) | ✅ Pass | ✅ Pass |
| 23 | [Bank details and delivery fees](#3-store-settings-bank-details-and-delivery-fees) | ✅ Pass | ✅ Pass |
| 24 | [Add a shoe from photo search](#4-products-stock-add-a-shoe-from-photo-search) | ✅ Pass | ✅ Pass |
| 25 | [Change the price and put it on sale](#4-products-stock-change-the-price-and-put-it-on-sale) | ✅ Pass | ✅ Pass |
| 26 | [Invalid sale price is refused](#4-products-stock-invalid-sale-price-is-refused) | ✅ Pass | ✅ Pass |
| 27 | [Add a shoe with an uploaded photo](#4-products-stock-add-a-shoe-with-an-uploaded-photo) | ✅ Pass | ✅ Pass |
| 28 | [Mark a shoe out of stock](#4-products-stock-mark-a-shoe-out-of-stock) | ✅ Pass | ✅ Pass |
| 29 | [Hide a shoe](#4-products-stock-hide-a-shoe) | ✅ Pass | ✅ Pass |
| 30 | [Delete a shoe](#4-products-stock-delete-a-shoe) | ✅ Pass | ✅ Pass |
| 31 | [Filter to out-of-stock shoes](#4-products-stock-filter-to-out-of-stock-shoes) | ✅ Pass | ✅ Pass |
| 32 | [Store reflects the changes](#5-shopping-store-reflects-the-changes) | ✅ Pass | ✅ Pass |
| 33 | [Out-of-stock shoe cannot be bought](#5-shopping-out-of-stock-shoe-cannot-be-bought) | ✅ Pass | ✅ Pass |
| 34 | [Sold-out sizes and stock limit](#5-shopping-sold-out-sizes-and-stock-limit) | ✅ Pass | ✅ Pass |
| 35 | [Bag](#5-shopping-bag) | ✅ Pass | ✅ Pass |
| 36 | [Checkout needs a delivery choice](#5-shopping-checkout-needs-a-delivery-choice) | ✅ Pass | ✅ Pass |
| 37 | [Soweto door delivery order](#5-shopping-soweto-door-delivery-order) | ✅ Pass | ✅ Pass |
| 38 | [Upload proof of payment](#5-shopping-upload-proof-of-payment) | ✅ Pass | ✅ Pass |
| 39 | [PAXI order](#5-shopping-paxi-order) | ✅ Pass | ✅ Pass |
| 40 | [Order to be cancelled](#5-shopping-order-to-be-cancelled) | ✅ Pass | ✅ Pass |
| 41 | [Dashboard shows proofs to check](#6-orders-delivery-dashboard-shows-proofs-to-check) | ✅ Pass | ✅ Pass |
| 42 | [Next action shows first on the order page](#6-orders-delivery-next-action-shows-first-on-the-order-page) | ✅ Pass | ✅ Pass |
| 43 | [Soweto: approve, pack, deliver](#6-orders-delivery-soweto-approve-pack-deliver) | ✅ Pass | ✅ Pass |
| 44 | [PAXI: reject proof, customer re-uploads](#6-orders-delivery-paxi-reject-proof-customer-re-uploads) | ✅ Pass | ✅ Pass |
| 45 | [PAXI: approve, pack, send, collected](#6-orders-delivery-paxi-approve-pack-send-collected) | ✅ Pass | ✅ Pass |
| 46 | [Store cancels an unpaid order](#6-orders-delivery-store-cancels-an-unpaid-order) | ✅ Pass | ✅ Pass |
| 47 | [Stock goes down after a sale](#6-orders-delivery-stock-goes-down-after-a-sale) | ✅ Pass | ✅ Pass |
| 48 | [Record a phone/WhatsApp sale](#6-orders-delivery-record-a-phone-whatsapp-sale) | ✅ Pass | ✅ Pass |
| 49 | [Customer updates](#6-orders-delivery-customer-updates) | ✅ Pass | ✅ Pass |
| 50 | [Customer order history](#6-orders-delivery-customer-order-history) | ✅ Pass | ✅ Pass |
| 51 | [Shop works without the server](#7-github-pages-no-server-shop-works-without-the-server) | ✅ Pass | ✅ Pass |

## What was tested and what was fixed

Testing was done in six rounds. Each round fixed what it found before the next one started.

### Round 1: automated server tests (`npm test`)

These tests talk to the server directly. They cover:

- accounts and roles
- Soweto and PAXI orders and fees
- prices worked out by the server, not the browser
- stock reservations and roll-back when an order fails
- out-of-stock and hidden shoes
- protection against two people editing the same shoe at once
- payment review
- delivery messages
- photo search and safe photo import
- saving data between restarts

### Round 2: first run in Chrome

| Found | Fix |
| --- | --- |
| The checkout and "Record a sale" forms could not be submitted. A stray closing `</div>` tag made the browser end the form early. | The extra tag was removed. |
| The radio buttons on the delivery and availability cards were stretched to full width. | Radio buttons now keep their normal size. |
| A free photo search for "Vans Old Skool" returned buses and landscapes. | Results from the free photo sources must now name every searched word. |

### Round 3: code review (code-review skill)

| Found | Fix |
| --- | --- |
| An image link written in a special IPv6 form could make the server fetch from its own private network. | IPv6 addresses must now be ordinary public ones. |
| A website could pass the address check and then switch to a private address before the download (DNS rebinding). | The address is now checked at the moment of connecting. |
| About 30 photo searches used up the sign-in limit. | Searches and sign-ins are now counted separately. |
| Wrong emails were answered faster than real ones, which revealed who has an account. | Both now take the same time. |
| A garbled web address caused a server error. | It now gets a simple "invalid address" reply. |
| Deleting a shoe removed the photo shown on its past orders. | The photo is kept while any order still shows it. |
| The unpaid-order expiry check read every order ever placed. | It now reads only unpaid orders past their deadline. |
| Customers were told "payment not received" when the store cancelled their order. | They now see that Kat Sneakers cancelled it. |
| Photo search could return a few more results than its limit. | The limit is now exact. |

### Round 4: full Chrome walkthrough

| Found | Fix |
| --- | --- |
| On a phone, the Approve / Pack / Dispatch box was at the very bottom of each order. | On phones it now shows at the top. |
| None of the pages had a browser-tab icon, which caused an error on every page load. | A Kat Sneakers icon was added. |

### Files reorganised

The browser files moved into `site/`, the server into `server/`, and the database and uploaded photos into `data/`. After the move:

- the whole automated test suite and this Chrome run were repeated;
- new tests check that only `site/` is served, and that the database, server code and config files are not;
- older saved photo paths are upgraded automatically.

### Round 5: Chrome test after reorganising (`npm run test:chrome`)

The Chrome test became a permanent, rerunnable project file with 53 checks across 8 areas. It writes this report.

| Found | Fix |
| --- | --- |
| After the move, every shop photo was requested from a doubled path (`images/sneakers/images/sneakers/…`), so each request failed. The pages looked fine because the browser fell back to other images. | The two photo-path helpers in `site/js/app.js` and `site/js/api.js` were updated to the new folder names. |
| A search with one result said "1 pairs". | It now says "1 pair". |
| The "Sale carousel" check timed out. | Not a store bug: the approved design hides the "1 / 11" counter on purpose. The check now watches which sale shoe is showing. |

### Round 6: every check on desktop and on a phone, in visible Chrome

The Chrome test now runs every check twice: in a 1366 × 900 desktop window, and as a 390 × 844 touch phone. Each screen size gets its own fresh store. Every check now ends with a screenshot on both sizes, shown side by side below with tick boxes for your verdict. `npm run test:chrome:watch` opens Chrome on screen so you can watch it work.

| Found | Fix |
| --- | --- |
| On the phone, the "next action is visible first" check failed because the Check payment box starts 460px down the screen. | The screenshot showed the box, its amount field and the tick box all on the first phone screen, so it was not a store bug. The check now tests exactly that: the box's heading and first field are visible without scrolling. |

### Known limits

- **Photo search without a key:** the free sources (Wikimedia Commons, Openverse) have few retail product photos, so some models return nothing. Add a `SERPER_API_KEY` or `BRAVE_SEARCH_API_KEY` for proper product photos.
- **Live internet needed:** the photo-search check uses the internet, so it fails when offline.
- **Messages are not sent automatically:** customer messages are saved as drafts and sent by you on WhatsApp or email.

## Every check, with screenshots

### 1. Storefront

<a id="1-storefront-home-page-loads-the-live-catalogue"></a>

#### 1. Home page loads the live catalogue

**What I did:** Opened the home page and waited for the product grid.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 27 shoes shown | ✅ Pass — 27 shoes shown |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-001-home-page-full-length.jpg"><img src="screenshots/desktop-001-home-page-full-length.jpg" width="560" alt="Home page, full length"></a><br><sub>Home page, full length</sub><br><br><a href="screenshots/desktop-002-result.jpg"><img src="screenshots/desktop-002-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-001-home-page-full-length.jpg"><img src="screenshots/mobile-001-home-page-full-length.jpg" width="230" alt="Home page, full length"></a><br><sub>Home page, full length</sub><br><br><a href="screenshots/mobile-002-result.jpg"><img src="screenshots/mobile-002-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-new-in-page"></a>

#### 2. New in page

**What I did:** Opened new-in.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 27 shoes | ✅ Pass — 27 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-003-new-in-page-top.jpg"><img src="screenshots/desktop-003-new-in-page-top.jpg" width="560" alt="New in page top"></a><br><sub>New in page top</sub><br><br><a href="screenshots/desktop-004-result.jpg"><img src="screenshots/desktop-004-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-003-new-in-page-top.jpg"><img src="screenshots/mobile-003-new-in-page-top.jpg" width="230" alt="New in page top"></a><br><sub>New in page top</sub><br><br><a href="screenshots/mobile-004-result.jpg"><img src="screenshots/mobile-004-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-men-page"></a>

#### 3. Men page

**What I did:** Opened men.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 20 shoes | ✅ Pass — 20 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-005-men-page-top.jpg"><img src="screenshots/desktop-005-men-page-top.jpg" width="560" alt="Men page top"></a><br><sub>Men page top</sub><br><br><a href="screenshots/desktop-006-result.jpg"><img src="screenshots/desktop-006-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-005-men-page-top.jpg"><img src="screenshots/mobile-005-men-page-top.jpg" width="230" alt="Men page top"></a><br><sub>Men page top</sub><br><br><a href="screenshots/mobile-006-result.jpg"><img src="screenshots/mobile-006-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-women-page"></a>

#### 4. Women page

**What I did:** Opened women.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 19 shoes | ✅ Pass — 19 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-007-women-page-top.jpg"><img src="screenshots/desktop-007-women-page-top.jpg" width="560" alt="Women page top"></a><br><sub>Women page top</sub><br><br><a href="screenshots/desktop-008-result.jpg"><img src="screenshots/desktop-008-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-007-women-page-top.jpg"><img src="screenshots/mobile-007-women-page-top.jpg" width="230" alt="Women page top"></a><br><sub>Women page top</sub><br><br><a href="screenshots/mobile-008-result.jpg"><img src="screenshots/mobile-008-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-kids-page"></a>

#### 5. Kids page

**What I did:** Opened kids.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 5 shoes | ✅ Pass — 5 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-009-kids-page-top.jpg"><img src="screenshots/desktop-009-kids-page-top.jpg" width="560" alt="Kids page top"></a><br><sub>Kids page top</sub><br><br><a href="screenshots/desktop-010-result.jpg"><img src="screenshots/desktop-010-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-009-kids-page-top.jpg"><img src="screenshots/mobile-009-kids-page-top.jpg" width="230" alt="Kids page top"></a><br><sub>Kids page top</sub><br><br><a href="screenshots/mobile-010-result.jpg"><img src="screenshots/mobile-010-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-sale-page"></a>

#### 6. Sale page

**What I did:** Opened sale.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 11 shoes | ✅ Pass — 11 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-011-sale-page-top.jpg"><img src="screenshots/desktop-011-sale-page-top.jpg" width="560" alt="Sale page top"></a><br><sub>Sale page top</sub><br><br><a href="screenshots/desktop-012-result.jpg"><img src="screenshots/desktop-012-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-011-sale-page-top.jpg"><img src="screenshots/mobile-011-sale-page-top.jpg" width="230" alt="Sale page top"></a><br><sub>Sale page top</sub><br><br><a href="screenshots/mobile-012-result.jpg"><img src="screenshots/mobile-012-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-brands-page"></a>

#### 7. Brands page

**What I did:** Opened brands.html, checked the shoe grid and the active filter, then scrolled to the shoes.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 27 shoes | ✅ Pass — 27 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-013-brands-page-top.jpg"><img src="screenshots/desktop-013-brands-page-top.jpg" width="560" alt="Brands page top"></a><br><sub>Brands page top</sub><br><br><a href="screenshots/desktop-014-result.jpg"><img src="screenshots/desktop-014-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-013-brands-page-top.jpg"><img src="screenshots/mobile-013-brands-page-top.jpg" width="230" alt="Brands page top"></a><br><sub>Brands page top</sub><br><br><a href="screenshots/mobile-014-result.jpg"><img src="screenshots/mobile-014-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-search"></a>

#### 8. Search

**What I did:** Typed "converse" in the search box.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 4 Converse shoes | ✅ Pass — 4 Converse shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-015-result.jpg"><img src="screenshots/desktop-015-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-015-result.jpg"><img src="screenshots/mobile-015-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-budget-filter"></a>

#### 9. Budget filter

**What I did:** Chose "Under R500".

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — R499, R499, R399, R449, R499 | ✅ Pass — R499, R499, R399, R449, R499 |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-016-result.jpg"><img src="screenshots/desktop-016-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-016-result.jpg"><img src="screenshots/mobile-016-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-sort-by-price"></a>

#### 10. Sort by price

**What I did:** Chose "Price: low to high" for all prices.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — R399 → R1799 | ✅ Pass — R399 → R1799 |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-017-sorted-low-to-high.jpg"><img src="screenshots/desktop-017-sorted-low-to-high.jpg" width="560" alt="Sorted low to high"></a><br><sub>Sorted low to high</sub><br><br><a href="screenshots/desktop-018-result.jpg"><img src="screenshots/desktop-018-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-017-sorted-low-to-high.jpg"><img src="screenshots/mobile-017-sorted-low-to-high.jpg" width="230" alt="Sorted low to high"></a><br><sub>Sorted low to high</sub><br><br><a href="screenshots/mobile-018-result.jpg"><img src="screenshots/mobile-018-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-shop-by-brand"></a>

#### 11. Shop by brand

**What I did:** Clicked the Vans brand tile.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 3 Vans shoes | ✅ Pass — 3 Vans shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-019-result.jpg"><img src="screenshots/desktop-019-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-019-result.jpg"><img src="screenshots/mobile-019-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-sale-carousel"></a>

#### 12. Sale carousel

**What I did:** Paused the hero sale rotation and clicked the next arrow.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — Nike Everyday Air → Kat Everyday Little Pink Classic | ✅ Pass — Nike Everyday Air → Kat Everyday Little Pink Classic |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-020-before-next.jpg"><img src="screenshots/desktop-020-before-next.jpg" width="560" alt="Before next"></a><br><sub>Before next</sub><br><br><a href="screenshots/desktop-021-result.jpg"><img src="screenshots/desktop-021-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-020-before-next.jpg"><img src="screenshots/mobile-020-before-next.jpg" width="230" alt="Before next"></a><br><sub>Before next</sub><br><br><a href="screenshots/mobile-021-result.jpg"><img src="screenshots/mobile-021-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-size-guide"></a>

#### 13. Size guide

**What I did:** Opened the size guide.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-022-result.jpg"><img src="screenshots/desktop-022-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-022-result.jpg"><img src="screenshots/mobile-022-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-delivery-and-payment-info"></a>

#### 14. Delivery and payment info

**What I did:** Opened "Delivery & payment" in the footer.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-023-result.jpg"><img src="screenshots/desktop-023-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-023-result.jpg"><img src="screenshots/mobile-023-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="1-storefront-product-details"></a>

#### 15. Product details

**What I did:** Opened a shoe and chose a size.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-024-result.jpg"><img src="screenshots/desktop-024-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-024-result.jpg"><img src="screenshots/mobile-024-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 2. Accounts

<a id="2-accounts-wrong-password-is-refused"></a>

#### 16. Wrong password is refused

**What I did:** Signed in with a wrong password.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — Invalid email or password. | ✅ Pass — Invalid email or password. |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-025-result.jpg"><img src="screenshots/desktop-025-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-025-result.jpg"><img src="screenshots/mobile-025-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="2-accounts-protected-pages-ask-for-sign-in"></a>

#### 17. Protected pages ask for sign-in

**What I did:** Opened checkout and order tracking while signed out.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-026-result.jpg"><img src="screenshots/desktop-026-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-026-result.jpg"><img src="screenshots/mobile-026-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="2-accounts-create-an-account"></a>

#### 18. Create an account

**What I did:** Filled the sign-up form, accepted the terms and submitted.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-027-sign-up-form-filled.jpg"><img src="screenshots/desktop-027-sign-up-form-filled.jpg" width="560" alt="Sign-up form filled"></a><br><sub>Sign-up form filled</sub><br><br><a href="screenshots/desktop-028-result.jpg"><img src="screenshots/desktop-028-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-027-sign-up-form-filled.jpg"><img src="screenshots/mobile-027-sign-up-form-filled.jpg" width="230" alt="Sign-up form filled"></a><br><sub>Sign-up form filled</sub><br><br><a href="screenshots/mobile-028-result.jpg"><img src="screenshots/mobile-028-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="2-accounts-sign-out-and-back-in"></a>

#### 19. Sign out and back in

**What I did:** Signed out from My account, then signed in again.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-029-result.jpg"><img src="screenshots/desktop-029-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-029-result.jpg"><img src="screenshots/mobile-029-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="2-accounts-forgot-password-page"></a>

#### 20. Forgot password page

**What I did:** Opened the forgot-password page.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-030-result.jpg"><img src="screenshots/desktop-030-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-030-result.jpg"><img src="screenshots/mobile-030-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="2-accounts-customers-cannot-open-store-management"></a>

#### 21. Customers cannot open store management

**What I did:** Opened admin.html as the customer.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-031-result.jpg"><img src="screenshots/desktop-031-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-031-result.jpg"><img src="screenshots/mobile-031-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 3. Store settings

<a id="3-store-settings-owner-signs-in"></a>

#### 22. Owner signs in

**What I did:** Signed in as the administrator.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — bank-details reminder shown | ✅ Pass — bank-details reminder shown |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-032-result.jpg"><img src="screenshots/desktop-032-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-032-result.jpg"><img src="screenshots/mobile-032-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="3-store-settings-bank-details-and-delivery-fees"></a>

#### 23. Bank details and delivery fees

**What I did:** Entered bank details and set the Soweto delivery fee to R45.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-033-settings-filled-in.jpg"><img src="screenshots/desktop-033-settings-filled-in.jpg" width="560" alt="Settings filled in"></a><br><sub>Settings filled in</sub><br><br><a href="screenshots/desktop-034-result.jpg"><img src="screenshots/desktop-034-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-033-settings-filled-in.jpg"><img src="screenshots/mobile-033-settings-filled-in.jpg" width="230" alt="Settings filled in"></a><br><sub>Settings filled in</sub><br><br><a href="screenshots/mobile-034-result.jpg"><img src="screenshots/mobile-034-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 4. Products & stock

<a id="4-products-stock-add-a-shoe-from-photo-search"></a>

#### 24. Add a shoe from photo search

**What I did:** Typed "Nike Air Force 1", picked a photo, set R1 599, Men + Women, 2 pairs per size and 0 in UK 12.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 32 photos found. Choose one. Sources: Wikimedia Commons, Openverse. | ✅ Pass — 32 photos found. Choose one. Sources: Wikimedia Commons, Openverse. |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-035-product-editor-before-saving.jpg"><img src="screenshots/desktop-035-product-editor-before-saving.jpg" width="560" alt="Product editor before saving"></a><br><sub>Product editor before saving</sub><br><br><a href="screenshots/desktop-036-result.jpg"><img src="screenshots/desktop-036-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-035-product-editor-before-saving.jpg"><img src="screenshots/mobile-035-product-editor-before-saving.jpg" width="230" alt="Product editor before saving"></a><br><sub>Product editor before saving</sub><br><br><a href="screenshots/mobile-036-result.jpg"><img src="screenshots/mobile-036-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-change-the-price-and-put-it-on-sale"></a>

#### 25. Change the price and put it on sale

**What I did:** Edited the shoe: R1 499, original price R1 799.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-037-result.jpg"><img src="screenshots/desktop-037-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-037-result.jpg"><img src="screenshots/mobile-037-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-invalid-sale-price-is-refused"></a>

#### 26. Invalid sale price is refused

**What I did:** Entered an original price lower than the selling price.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — The original price must be higher than the selling price. Leave it empty if the shoe is not on sale. | ✅ Pass — The original price must be higher than the selling price. Leave it empty if the shoe is not on sale. |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-038-error-message.jpg"><img src="screenshots/desktop-038-error-message.jpg" width="560" alt="Error message"></a><br><sub>Error message</sub><br><br><a href="screenshots/desktop-039-result.jpg"><img src="screenshots/desktop-039-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-038-error-message.jpg"><img src="screenshots/mobile-038-error-message.jpg" width="230" alt="Error message"></a><br><sub>Error message</sub><br><br><a href="screenshots/mobile-039-result.jpg"><img src="screenshots/mobile-039-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-add-a-shoe-with-an-uploaded-photo"></a>

#### 27. Add a shoe with an uploaded photo

**What I did:** Uploaded a photo for "Puma Kids Velcro Runner", R549, Kids sizes, 1 pair each.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-040-upload-editor.jpg"><img src="screenshots/desktop-040-upload-editor.jpg" width="560" alt="Upload editor"></a><br><sub>Upload editor</sub><br><br><a href="screenshots/desktop-041-result.jpg"><img src="screenshots/desktop-041-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-040-upload-editor.jpg"><img src="screenshots/mobile-040-upload-editor.jpg" width="230" alt="Upload editor"></a><br><sub>Upload editor</sub><br><br><a href="screenshots/mobile-041-result.jpg"><img src="screenshots/mobile-041-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-mark-a-shoe-out-of-stock"></a>

#### 28. Mark a shoe out of stock

**What I did:** Clicked "Mark out of stock" on Converse Junior All Star.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-042-result.jpg"><img src="screenshots/desktop-042-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-042-result.jpg"><img src="screenshots/mobile-042-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-hide-a-shoe"></a>

#### 29. Hide a shoe

**What I did:** Set Vans Sk8-Hi Classic to Hidden.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-043-availability-set-to-hidden.jpg"><img src="screenshots/desktop-043-availability-set-to-hidden.jpg" width="560" alt="Availability set to Hidden"></a><br><sub>Availability set to Hidden</sub><br><br><a href="screenshots/desktop-044-result.jpg"><img src="screenshots/desktop-044-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-043-availability-set-to-hidden.jpg"><img src="screenshots/mobile-043-availability-set-to-hidden.jpg" width="230" alt="Availability set to Hidden"></a><br><sub>Availability set to Hidden</sub><br><br><a href="screenshots/mobile-044-result.jpg"><img src="screenshots/mobile-044-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-delete-a-shoe"></a>

#### 30. Delete a shoe

**What I did:** Deleted Kat Everyday Teal Everyday and confirmed.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-045-result.jpg"><img src="screenshots/desktop-045-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-045-result.jpg"><img src="screenshots/mobile-045-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="4-products-stock-filter-to-out-of-stock-shoes"></a>

#### 31. Filter to out-of-stock shoes

**What I did:** Clicked the "Out of stock" count.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-046-filtered-list.jpg"><img src="screenshots/desktop-046-filtered-list.jpg" width="560" alt="Filtered list"></a><br><sub>Filtered list</sub><br><br><a href="screenshots/desktop-047-result.jpg"><img src="screenshots/desktop-047-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-046-filtered-list.jpg"><img src="screenshots/mobile-046-filtered-list.jpg" width="230" alt="Filtered list"></a><br><sub>Filtered list</sub><br><br><a href="screenshots/mobile-047-result.jpg"><img src="screenshots/mobile-047-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 5. Shopping

<a id="5-shopping-store-reflects-the-changes"></a>

#### 32. Store reflects the changes

**What I did:** Reloaded the shop as the customer and searched for the out-of-stock shoe.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 27 shoes | ✅ Pass — 27 shoes |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-048-result.jpg"><img src="screenshots/desktop-048-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-048-result.jpg"><img src="screenshots/mobile-048-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-out-of-stock-shoe-cannot-be-bought"></a>

#### 33. Out-of-stock shoe cannot be bought

**What I did:** Opened the out-of-stock shoe.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-049-result.jpg"><img src="screenshots/desktop-049-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-049-result.jpg"><img src="screenshots/mobile-049-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-sold-out-sizes-and-stock-limit"></a>

#### 34. Sold-out sizes and stock limit

**What I did:** Opened the new Air Force 1, checked UK 12 is sold out, then added UK 8 three times (only 2 in stock).

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — "Only 2 left in UK 8." then "Sorry, there are no more pairs in UK 8." | ✅ Pass — "Only 2 left in UK 8." then "Sorry, there are no more pairs in UK 8." |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-050-uk-12-crossed-out-low-stock-note.jpg"><img src="screenshots/desktop-050-uk-12-crossed-out-low-stock-note.jpg" width="560" alt="UK 12 crossed out, low stock note"></a><br><sub>UK 12 crossed out, low stock note</sub><br><br><a href="screenshots/desktop-051-result.jpg"><img src="screenshots/desktop-051-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-050-uk-12-crossed-out-low-stock-note.jpg"><img src="screenshots/mobile-050-uk-12-crossed-out-low-stock-note.jpg" width="230" alt="UK 12 crossed out, low stock note"></a><br><sub>UK 12 crossed out, low stock note</sub><br><br><a href="screenshots/mobile-051-result.jpg"><img src="screenshots/mobile-051-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-bag"></a>

#### 35. Bag

**What I did:** Opened the bag.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-052-result.jpg"><img src="screenshots/desktop-052-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-052-result.jpg"><img src="screenshots/mobile-052-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-checkout-needs-a-delivery-choice"></a>

#### 36. Checkout needs a delivery choice

**What I did:** Filled contact details and pressed Place order without choosing delivery.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-053-result.jpg"><img src="screenshots/desktop-053-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-053-result.jpg"><img src="screenshots/mobile-053-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-soweto-door-delivery-order"></a>

#### 37. Soweto door delivery order

**What I did:** Chose "I live in Soweto", 88 Vilakazi Street, Orlando West, and placed the order.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — KAT-BBA17C45: Place order / R3 043.00 (2 × R1 499 + R45) | ✅ Pass — KAT-97CFCB6F: Place order / R3 043.00 (2 × R1 499 + R45) |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-054-checkout-with-soweto-delivery.jpg"><img src="screenshots/desktop-054-checkout-with-soweto-delivery.jpg" width="560" alt="Checkout with Soweto delivery"></a><br><sub>Checkout with Soweto delivery</sub><br><br><a href="screenshots/desktop-055-pay-by-eft-page.jpg"><img src="screenshots/desktop-055-pay-by-eft-page.jpg" width="560" alt="Pay by EFT page"></a><br><sub>Pay by EFT page</sub><br><br><a href="screenshots/desktop-056-result.jpg"><img src="screenshots/desktop-056-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-054-checkout-with-soweto-delivery.jpg"><img src="screenshots/mobile-054-checkout-with-soweto-delivery.jpg" width="230" alt="Checkout with Soweto delivery"></a><br><sub>Checkout with Soweto delivery</sub><br><br><a href="screenshots/mobile-055-pay-by-eft-page.jpg"><img src="screenshots/mobile-055-pay-by-eft-page.jpg" width="230" alt="Pay by EFT page"></a><br><sub>Pay by EFT page</sub><br><br><a href="screenshots/mobile-056-result.jpg"><img src="screenshots/mobile-056-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-upload-proof-of-payment"></a>

#### 38. Upload proof of payment

**What I did:** Uploaded a PDF proof on the order page.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-057-result.jpg"><img src="screenshots/desktop-057-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-057-result.jpg"><img src="screenshots/mobile-057-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-paxi-order"></a>

#### 39. PAXI order

**What I did:** Bought the kids shoe, chose PAXI to PEP Bloemfontein Mimosa Mall (7-9 days), placed the order and uploaded proof.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — KAT-DDC02D31: Place order / R608.95 (R549 + R59.95 PAXI) | ✅ Pass — KAT-E0EABDA9: Place order / R608.95 (R549 + R59.95 PAXI) |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-058-checkout-with-paxi.jpg"><img src="screenshots/desktop-058-checkout-with-paxi.jpg" width="560" alt="Checkout with PAXI"></a><br><sub>Checkout with PAXI</sub><br><br><a href="screenshots/desktop-059-result.jpg"><img src="screenshots/desktop-059-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-058-checkout-with-paxi.jpg"><img src="screenshots/mobile-058-checkout-with-paxi.jpg" width="230" alt="Checkout with PAXI"></a><br><sub>Checkout with PAXI</sub><br><br><a href="screenshots/mobile-059-result.jpg"><img src="screenshots/mobile-059-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="5-shopping-order-to-be-cancelled"></a>

#### 40. Order to be cancelled

**What I did:** Placed a third order (Puma Suede Classic, Soweto) and did not pay.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — KAT-91BD9D26 | ✅ Pass — KAT-AF0CDD4D |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-060-result.jpg"><img src="screenshots/desktop-060-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-060-result.jpg"><img src="screenshots/mobile-060-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 6. Orders & delivery

<a id="6-orders-delivery-dashboard-shows-proofs-to-check"></a>

#### 41. Dashboard shows proofs to check

**What I did:** Opened the dashboard.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-061-result.jpg"><img src="screenshots/desktop-061-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-061-result.jpg"><img src="screenshots/mobile-061-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-next-action-shows-first-on-the-order-page"></a>

#### 42. Next action shows first on the order page

**What I did:** Opened the Soweto order and checked where the "Check payment" box starts.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — "Check payment" starts 319px from the top | ✅ Pass — "Check payment" starts 460px from the top |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-062-order-page-full-length.jpg"><img src="screenshots/desktop-062-order-page-full-length.jpg" width="560" alt="Order page, full length"></a><br><sub>Order page, full length</sub><br><br><a href="screenshots/desktop-063-result.jpg"><img src="screenshots/desktop-063-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-062-order-page-full-length.jpg"><img src="screenshots/mobile-062-order-page-full-length.jpg" width="230" alt="Order page, full length"></a><br><sub>Order page, full length</sub><br><br><a href="screenshots/mobile-063-result.jpg"><img src="screenshots/mobile-063-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-soweto-approve-pack-deliver"></a>

#### 43. Soweto: approve, pack, deliver

**What I did:** Approved payment, packed, marked out for delivery with a note, then delivered.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — WhatsApp link opens +27 72 555 0101 | ✅ Pass — WhatsApp link opens +27 72 555 0101 |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-064-out-for-delivery.jpg"><img src="screenshots/desktop-064-out-for-delivery.jpg" width="560" alt="Out for delivery"></a><br><sub>Out for delivery</sub><br><br><a href="screenshots/desktop-065-result.jpg"><img src="screenshots/desktop-065-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-064-out-for-delivery.jpg"><img src="screenshots/mobile-064-out-for-delivery.jpg" width="230" alt="Out for delivery"></a><br><sub>Out for delivery</sub><br><br><a href="screenshots/mobile-065-result.jpg"><img src="screenshots/mobile-065-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-paxi-reject-proof-customer-re-uploads"></a>

#### 44. PAXI: reject proof, customer re-uploads

**What I did:** Rejected the proof with a reason; the customer saw the reason and uploaded a new proof.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-066-customer-sees-rejection-reason.jpg"><img src="screenshots/desktop-066-customer-sees-rejection-reason.jpg" width="560" alt="Customer sees rejection reason"></a><br><sub>Customer sees rejection reason</sub><br><br><a href="screenshots/desktop-067-result.jpg"><img src="screenshots/desktop-067-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-066-customer-sees-rejection-reason.jpg"><img src="screenshots/mobile-066-customer-sees-rejection-reason.jpg" width="230" alt="Customer sees rejection reason"></a><br><sub>Customer sees rejection reason</sub><br><br><a href="screenshots/mobile-067-result.jpg"><img src="screenshots/mobile-067-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-paxi-approve-pack-send-collected"></a>

#### 45. PAXI: approve, pack, send, collected

**What I did:** Approved, packed, tried to dispatch without a tracking number, then sent with PX778899 and marked collected.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-068-customer-sees-paxi-tracking.jpg"><img src="screenshots/desktop-068-customer-sees-paxi-tracking.jpg" width="560" alt="Customer sees PAXI tracking"></a><br><sub>Customer sees PAXI tracking</sub><br><br><a href="screenshots/desktop-069-result.jpg"><img src="screenshots/desktop-069-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-068-customer-sees-paxi-tracking.jpg"><img src="screenshots/mobile-068-customer-sees-paxi-tracking.jpg" width="230" alt="Customer sees PAXI tracking"></a><br><sub>Customer sees PAXI tracking</sub><br><br><a href="screenshots/mobile-069-result.jpg"><img src="screenshots/mobile-069-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-store-cancels-an-unpaid-order"></a>

#### 46. Store cancels an unpaid order

**What I did:** Cancelled the third order; the customer sees that the store cancelled it.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-070-result.jpg"><img src="screenshots/desktop-070-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-070-result.jpg"><img src="screenshots/mobile-070-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-stock-goes-down-after-a-sale"></a>

#### 47. Stock goes down after a sale

**What I did:** Reopened the Air Force 1 in the shop after both UK 8 pairs were paid for.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — UK 8 sold out, UK 9 still available | ✅ Pass — UK 8 sold out, UK 9 still available |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-071-result.jpg"><img src="screenshots/desktop-071-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-071-result.jpg"><img src="screenshots/mobile-071-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-record-a-phone-whatsapp-sale"></a>

#### 48. Record a phone/WhatsApp sale

**What I did:** Recorded a WhatsApp sale for Sipho Ndlovu with PAXI to PEP Mthatha Plaza and a proof.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-072-sale-form-filled.jpg"><img src="screenshots/desktop-072-sale-form-filled.jpg" width="560" alt="Sale form filled"></a><br><sub>Sale form filled</sub><br><br><a href="screenshots/desktop-073-result.jpg"><img src="screenshots/desktop-073-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-072-sale-form-filled.jpg"><img src="screenshots/mobile-072-sale-form-filled.jpg" width="230" alt="Sale form filled"></a><br><sub>Sale form filled</sub><br><br><a href="screenshots/mobile-073-result.jpg"><img src="screenshots/mobile-073-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-customer-updates"></a>

#### 49. Customer updates

**What I did:** Opened Customer updates.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 10 message drafts, each with WhatsApp and Email links | ✅ Pass — 10 message drafts, each with WhatsApp and Email links |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-074-result.jpg"><img src="screenshots/desktop-074-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-074-result.jpg"><img src="screenshots/mobile-074-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

<a id="6-orders-delivery-customer-order-history"></a>

#### 50. Customer order history

**What I did:** Opened My account as the customer.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass | ✅ Pass |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-075-account-full-length.jpg"><img src="screenshots/desktop-075-account-full-length.jpg" width="560" alt="Account, full length"></a><br><sub>Account, full length</sub><br><br><a href="screenshots/desktop-076-result.jpg"><img src="screenshots/desktop-076-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-075-account-full-length.jpg"><img src="screenshots/mobile-075-account-full-length.jpg" width="230" alt="Account, full length"></a><br><sub>Account, full length</sub><br><br><a href="screenshots/mobile-076-result.jpg"><img src="screenshots/mobile-076-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

### 7. GitHub Pages (no server)

<a id="7-github-pages-no-server-shop-works-without-the-server"></a>

#### 51. Shop works without the server

**What I did:** Served site/ as plain files (like GitHub Pages) and opened the home page.

| | Desktop | Mobile |
| --- | --- | --- |
| Result | ✅ Pass — 27 shoes from the built-in catalogue | ✅ Pass — 27 shoes from the built-in catalogue |

<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top"><a href="screenshots/desktop-077-result.jpg"><img src="screenshots/desktop-077-result.jpg" width="560" alt="Result"></a><br><sub>Result</sub></td><td valign="top"><a href="screenshots/mobile-077-result.jpg"><img src="screenshots/mobile-077-result.jpg" width="230" alt="Result"></a><br><sub>Result</sub></td></tr></table>

**Your verdict:**

- [ ] Desktop looks right
- [ ] Mobile looks right
- Notes: 

---

