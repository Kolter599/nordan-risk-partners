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

## Sitemap-datoer

Sitemap'ets `<lastmod>` kommer fra `lib/lastmod.ts`, som er **genereret og committet** —
ikke beregnet under build. Det er hele pointen: et `lastmod` der altid er "i dag" er
præcis det signal Google lærer at ignorere.

Det sker **automatisk**: en GitHub Action kører ved hvert push til main, aflæser
historikken og committer datoerne tilbage — men kun hvis de faktisk har flyttet sig.
Du skal ikke huske noget.

```bash
npm run lastmod            # kan køres i hånden, hvis du vil se resultatet med det samme
npm run lastmod -- --check # se kun hvad der ville ændre sig
```

Kommandoen aflæser git-historikken. Reglen er at en side kun får ny dato når dens eget
indhold er ændret:

| Sidetype | Hvad datoen aflæses fra |
|---|---|
| Statiske sider | Filerne i sidens egen `app/`-mappe |
| Produktsider | Den enkelte entry i `lib/insurance-products.ts` (`git blame` pr. linjeinterval) |
| Artikler | Den enkelte entry i `lib/articles.ts`, aldrig tidligere end `publishedAt` |
| Hub-sider | Egen mappe eller nyeste barn — det nyeste vinder |

Delte ting er bevidst udeladt: `app/_components/`, `app/layout.tsx` og `lib/seo.ts`.
Retter du navigationen eller en farve, har undersiden ikke ændret indhold, og så skal
Google ikke have besked. Produkter og artikler dateres pr. entry, så en rettelse i én
produkttekst kun rykker den ene side — ikke alle 29.

Har du ikke-committede ændringer, får siden **ikke** dagens dato — den bliver stående
på seneste commit, og kommandoen advarer. En dato skal altid være dækket af en commit,
ellers kan en gammel glemt ændring i arbejdstræet stemple siden som ændret i dag.
Commit indholdet først, kør så kommandoen.

Glemmer du at køre kommandoen, sker der ingen skade: datoen bliver stående på den
forrige. En rute der mangler i kortet får slet ingen `<lastmod>` — ingen oplysning er
bedre end en forkert.
