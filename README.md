# lcrsea

Lockersea Web Application

---

## Sites and domains

One Vercel project serves every domain. The hostname selects the application at
the entry point, so a product domain is the product entry point. There is no
`/product` route and no page to click through first.

| Host | Serves |
| --- | --- |
| `enmero.in` | The Enmero website |
| `watchtower.enmero.in` | Watch Tower |

Adding a product is one entry in `SITES` in `src/sites.js` plus one line in
`SITE_ROOTS` in `src/main.jsx`.

### Local development

One dev server hosts both sites. Browsers send any `*.localhost` name to the
loopback address on their own, so no hosts file entry is needed.

```bash
npm run dev
```

| Address | Serves |
| --- | --- |
| http://localhost:3000 | The Enmero website |
| http://watchtower.localhost:3000 | Watch Tower |

`npm run preview` behaves the same way. A hosts file entry pointing a real
product domain at `127.0.0.1` also works, because the dev server accepts
`*.enmero.in`.

### Site addresses

`VITE_ENMERO_URL` and `VITE_WATCHTOWER_URL` are read in `src/sites.js` and
nowhere else, so a link to another site is never written by hand in a
component. See `.env.example`.

### Contact forms

The General Contact, Service Enquiry and Demo Request forms post directly to
Formspree from the browser. There is no function and no server in between.

`VITE_FORMSPREE_ENDPOINT` is read in `src/data/forms.js` and nowhere else, so
the endpoint is written in one place. It is the only value that decides where
enquiries go.

Formspree's browser endpoint is public by design, it only accepts submissions,
and it cannot be called from a server without a secret, so the `VITE_` prefix
is correct here rather than careless. Restrict the form to the `enmero.in`
domain in the Formspree dashboard so the endpoint only accepts this site.

See `.env.example`.

---

## 🔒 License & Copyright

**Copyright © 2024-2026 Lockersea / megeezy. All Rights Reserved.**

This repository and its contents (including all source code, UI/UX designs, assets, schemas, and documentation) are proprietary and confidential.

- **No Unauthorized Copying:** You may not copy, reproduce, duplicate, fork, redistribute, or mirror any part of this project.
- **No Commercial / Competitive Use:** You may not use this software, or derivatives thereof, for any commercial purposes, competitive SaaS services, or product offerings without explicit prior written authorization from the owner.
- **Source-Available Only:** Public viewing of this repository does not grant any rights to use, modify, distribute, or sublicense the code.

For complete terms, please refer to the [LICENSE](LICENSE) file.

