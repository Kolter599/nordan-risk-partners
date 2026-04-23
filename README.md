# Nordan Risk Partners · nordanriskpartners.dk

Erhvervsforsikringsmægler — Next.js 16 + Tailwind v4. Klonet fra den nuværende Squarespace-side med marketingforbedringer (scrolling logo-bar, flere CTA'er, sticky mobil-CTA, SaaS-variant på `/saas`).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript strict
- Tailwind v4
- Montserrat via `next/font`
- Kontaktformular → SMTP (nodemailer)

## Lokal dev

```bash
npm install
cp .env.example .env.local   # udfyld SMTP-adgangskoder
npm run dev                  # http://localhost:3000
```

## Miljøvariabler

```env
MAIL_SMTP_HOST=smtp.migadu.com
MAIL_SMTP_PORT=465
MAIL_SMTP_USER=info@ndrp.dk
MAIL_SMTP_PASS=<mailboks-adgangskode>
CONTACT_TO_EMAIL=info@ndrp.dk
```

## Routes

- `/` — Forside (klassisk forsikringsmægler-layout, klon af den nuværende side + forbedringer)
- `/saas` — Alternativ Norlix-inspireret lead-gen version
- `/om-os`
- `/hvorfor-forsikringsmaegler`
- `/saadan-arbejder-vi`
- `/erhvervsforsikringer`
- `/hole-in-one-forsikring`
- `/fredede-ejendomme-forsikring`
- `/arbejdsskadeforsikring`
- `/forsikring-andelsboligforening-ejerforening`
- `/erhvervs-og-produktansvarsforsikring`
- `/kontakt-os`

## Design-noter

Farver udtrukket fra live Squarespace CSS:

- `--nordan-dark` `#253f32` (dybgrøn – footer / mørke sektioner)
- `--nordan-accent` `#a58878` (varm taupe – hover / subtile accenter)
- `--nordan-ink` `#000000`
- `--nordan-soft` `#f0f0f0`
- `--nordan-bg` `#ffffff`

Font: Montserrat (body + headings), 300/400/500/600/700.

Logo: `public/images/logo.png` (hentet fra live site).
