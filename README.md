# Kat Sneakers

Online sneaker store with a customer storefront, EFT checkout and a store-management area. It runs on Node.js 24+ with its built-in SQLite. There are no packages to install.

## Run it

```powershell
npm.cmd start              # http://localhost:3000
npm.cmd run create-admin   # in a second terminal, the first time only
```

Sign in at `/admin.html` with the administrator you created. Customer sign-up never grants admin access.

## Folders

| Folder | What is in it |
| --- | --- |
| `site/` | Everything the browser loads: the pages, `css/`, `js/`, `images/sneakers/` and `favicon.svg`. This is also what GitHub Pages publishes. |
| `server/` | The store server: `index.mjs` (web server and API), `store.mjs` (database, products, orders), `delivery.mjs` (Soweto / PAXI rules) and `images.mjs` (photo search and safe import). |
| `data/` | Created on first run and not in Git: `kat.sqlite` (accounts, orders, stock, settings) and `uploads/` (shoe photos you add). **Back up this folder.** |
| `scripts/` | `create-admin.mjs`, plus `build-overview.ps1`, which rebuilds the Word overview in `docs/deliverables/`. |
| `tests/` | `store.test.mjs` (server tests) and `e2e/chrome-qa.mjs` (full Chrome test). |
| `docs/` | Project brief, architecture notes, the Word overview, and `testing/TEST-REPORT.md` with screenshots. |

## Delivery

- **Soweto:** Kat Sneakers delivers to the customer's door. The customer gives a street address and picks their Soweto area. The admin marks the order *out for delivery* and then *delivered*.
- **Everywhere else: PAXI.** The customer chooses a PAXI Point (code, PEP store name or suburb) and a speed (7-9 or 3-5 business days). The admin drops the parcel at PAXI, enters the PAXI tracking number, and the customer gets an SMS PIN from PAXI and collects with their ID.

Fees and delivery times are set in **Store management > Settings**. The defaults are R50 for Soweto, plus PAXI's published standard-bag prices: R59.95 for 7-9 days and R109.95 for 3-5 days. Check these against paxi.co.za.

## Products & stock

**Store management > Products & stock**:

1. **Add a shoe:** type or pick the shoe (e.g. "Nike Air Max 90"). The brand fills in and a photo search runs. Click a photo to use it, or upload your own or paste a link.
2. Set the **selling price**, plus an **original price** if the shoe is on sale (this shows the red SAVE tag).
3. Enter **stock per UK size**. A size at 0 shows crossed out in the store. When all sizes are at 0 the shoe shows **Out of stock** and cannot be bought.
4. **Mark out of stock** / **Back in stock** is one click from the list. **Hidden** removes a shoe from the store without deleting it.

Chosen photos are copied into `data/uploads/` on the server. Only use photos you are allowed to use, such as supplier or brand product shots, or your own.

**Photo search sources:** Wikimedia Commons and Openverse work without setup, but they hold few retail product shots, so many models return nothing. For proper product photos, set one of these keys before `npm start`:

```powershell
$env:SERPER_API_KEY = "..."         # Google Images via serper.dev (free tier available)
$env:BRAVE_SEARCH_API_KEY = "..."   # Brave Search API
```

## Orders and payment

1. Customer signs in, adds pairs, chooses Soweto delivery or PAXI, and places the order. The server reserves stock and calculates every price.
2. The customer sees the bank details from Settings, pays by EFT and uploads proof (JPG/PNG/PDF, max 2 MB, stored privately).
3. The admin checks that the money is in the bank and approves the payment, or rejects the proof with a reason. Unpaid orders are cancelled after 48 hours and their stock is released.
4. Pack, then dispatch (Soweto delivery or PAXI with a tracking number), then mark delivered or collected. Each step saves a customer message with **Send on WhatsApp** and **Email** buttons.

## Configuration

| Variable | Purpose |
| --- | --- |
| `PORT` / `HOST` | Listen address (default `127.0.0.1:3000`) |
| `KAT_DB` | SQLite file (default `data/kat.sqlite`). Back up the whole `data/` folder, which also holds `uploads/`. |
| `ALLOWED_HOSTS` | Comma-separated public host names when deployed, e.g. `katsneakers.co.za` |
| `COOKIE_SECURE=true` | Required behind HTTPS |
| `TRUST_PROXY=true` | Only behind a reverse proxy, so rate limits count each visitor rather than the proxy |
| `SERPER_API_KEY`, `BRAVE_SEARCH_API_KEY` | Optional photo search providers |

On first run, the starter catalogue in `site/js/catalogue.js` is loaded with 10 pairs per size. Replace those counts with real stock before launch.

GitHub Pages can only host the static storefront. The `pages.yml` workflow publishes the `site/` folder, and it falls back to the built-in catalogue. Checkout, accounts and store management need this Node server on a host with HTTPS and persistent disk.

## Tests

```powershell
npm.cmd test              # server tests, a few seconds
npm.cmd run test:chrome   # full walkthrough in Google Chrome, about 3 minutes
```

The Chrome test starts its own store on a throwaway database, so your `data/` folder is never touched. It shops as a customer and runs the store as the owner across 53 checks, then rewrites **[docs/testing/TEST-REPORT.md](docs/testing/TEST-REPORT.md)** with a screenshot for each important step. To add to the "What was tested and what was fixed" section of that report, edit `docs/testing/findings.md`. The Chrome test needs Google Chrome and `playwright-core` (`npm install -g playwright-core`).

The server tests cover:

- accounts and roles
- Soweto and PAXI orders and fees
- prices worked out by the server
- stock reservations and roll-back
- out-of-stock and hidden products
- protection against two people editing the same shoe at once
- payment review and delivery messages
- photo search filtering
- safe photo import (private-network and redirect blocking, file-type checks)
- which files the server will serve
- data persistence
