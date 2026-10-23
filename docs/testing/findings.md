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
