# Kat Sneakers wireframes

This is an HTML/CSS/JavaScript presentation with mock data. There is no application server, authentication service, database requirement or payment integration.

## Present the idea

Open `demo.html` in your browser for the walkthrough, or `index.html` for the storefront. No installation is required.

For a consistent shared browser-storage origin, optionally run a static preview:

```powershell
npm.cmd start
```

Open **http://localhost:3000/demo.html**. This serves files only; it does not run a backend. Alternatively use `python -m http.server 8001 --bind 127.0.0.1`.

## Walkthrough

1. Browse the homepage and animated sale rotation. Click a sale shoe to view its price and UK sizes.
2. Open customer login or signup. Any details work; passwords are never saved or checked.
3. Continue to checkout. A sample bag is supplied if yours is empty, and customer details are prefilled. Forms do not block the presentation on validation.
4. Place the order and show its EFT instructions. Submit the sample proof with or without selecting a file. Files are not uploaded.
5. Open `admin.html` directly: no admin credentials are required. Six fictional orders populate the dashboard.
6. Approve payment, mark packed, then mark shipped. Tracking fields are prefilled and customer updates show as sent (simulated). No email application or external service is opened.
7. View customer order tracking or account history. All presentation orders are visible so every screen is easy to demonstrate.
8. Use **Reset sample data** on `demo.html` before the next pitch.

Orders and display names use browser localStorage when available, with an in-memory fallback. Use the same browser and URL origin throughout the demo. Payments, account security, stock enforcement and messaging will be built later. All bank details and order information are fictional.

The previous backend source was archived outside the project under `../Kat-Sneakers-backups/server-version-*.zip` for later reference. No changes have been deployed.
