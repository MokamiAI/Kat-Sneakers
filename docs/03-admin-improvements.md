# Admin improvements and implementation plan

## Review basis

This review covers the brief and architecture in this workspace. There is no
application source, package manifest, database, or runnable admin here, so these
are specification improvements rather than findings from a working interface.

## Recommended priorities

| Priority | Improvement | Result for the owner |
| --- | --- | --- |
| 1 | Action dashboard | See proofs waiting for review, paid orders to pack, packed orders to ship, and low-stock variants immediately. Each count opens its filtered list. |
| 1 | Payment-review queue | Review oldest proofs first, compare claimed and outstanding amounts, and see duplicate-proof warnings beside the proof. |
| 1 | Guided order actions | Offer only valid next steps, with explicit bank confirmation before recording payment and tracking details before shipping. |
| 1 | Stock by size | Show physical, reserved, and available stock for each colour and size, with searchable SKUs and low-stock filters. |
| 2 | Searchable order workspace | Search order reference, customer, and tracking number; filter by status and date; retain filters when returning from a detail page. |
| 2 | Staff accountability | Record actor, time, previous value, new value, and reason for payment, stock, settings, and order changes. |
| 2 | Reliable customer updates | Preview messages before an action and show delivery failures with a retry action. A messaging failure must not undo payment approval. |
| 3 | Lay-by workspace | Show agreed terms, confirmed payments, remaining balance, next due date, and overdue accounts. Enable shipment only after full payment. |

## First implementation slice

Build dashboard, orders list, and order detail together, using the existing
Next.js architecture once its source is available. Complete payment review and
fulfilment before adding sales charts or bulk operations.

### Dashboard

- Show actionable counts with the oldest waiting item and a link to each queue.
- Define sales as confirmed payments in the selected period, with refunds
  deducted and cancelled/unpaid orders excluded. Label the period clearly.
- Display loading, empty, and failed states; never replace failed data with zero.
- Use Africa/Johannesburg for displayed business dates and ZAR integer cents for money.

### Orders and payment review

- Paginate and filter on the server. Keep search, filters, and page in the URL.
- Show reference, customer, total, outstanding balance, status, and age.
- On the detail page, show purchased items and sizes, delivery address, proof
  history, confirmed payment total, and a chronological activity log.
- Open private proof files through short-lived signed URLs available to owners.
- Require the owner to enter the amount actually received and confirm that the
  bank reflects it. A proof upload alone must never mark an order paid.
- Reject a proof with a required reason and a preview of the customer message.
- Record partial lay-by payments without marking the order fully paid. A
  duplicate hash triggers review; it does not automatically establish fraud.

### Order and inventory correctness

- Enforce roles and allowed transitions on the server for every mutation.
  Packers may pack and ship; only owners may review payments or change bank details.
- Keep payment review state separate from fulfilment state. A rejected new proof
  must not erase earlier confirmed instalments.
- Apply payment recording, stock commitment, and order events in a database
  transaction. Reject stale submissions and make repeated requests idempotent.
- Maintain physical stock and active reservations explicitly: available stock
  equals physical stock minus reservations. Approval consumes the reservation
  and decreases physical stock once; cancellation releases reservations once.
- Expire unpaid reservations in a scheduled job. Orders with pending proof review
  require an explicit expiry policy so review delays do not cancel paid customers.
- Require a completed packing checklist before packing, and courier plus tracking
  before shipment. Log any owner override with a reason.
- Queue notifications durably with retries and deduplication after the transaction.

### Usability and accessibility

- Follow the existing crease admin shell and text-labelled status colours.
- On mobile, make each order's primary action accessible without horizontal scrolling.
- Label every form control, preserve keyboard focus after dialogs, and announce
  save errors. Prevent repeated clicks while saving and retain input on failure.
- Show a specific empty-state action, such as clearing filters or adding a product.

## Acceptance checks for the first slice

1. Dashboard counts and filtered queues agree for the same dataset and permissions.
2. A packer cannot retrieve payment proofs or approve payments through direct requests.
3. Two simultaneous approvals record one payment and consume inventory once.
4. Partial payment leaves a balance; only full confirmed payment unlocks packing.
5. Cancel/expiry races never create negative available stock or release stock twice.
6. Invalid status transitions fail on the server and leave the order unchanged.
7. A failed customer notification remains visible and retryable without repeating payment recording.
8. Search and filters survive navigation, and order review works at 360px with keyboard access.

## Decisions needed before production

- Confirm the actual application location and current authentication/database setup.
- Reconcile the brief's gateway/refund scope with the architecture's manual EFT v1.
- Agree on payment-review expiry, lay-by default handling, and refund/restock rules.
- Confirm which staff roles exist and who can change stock or customer details.
