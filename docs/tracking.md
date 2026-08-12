# Tracking — events fra siten til GA4 / GTM + admin-database

Hver vigtig overgang i flowet sendes til **både**:

1. **Klient-side** via `track()` (i `app/_components/GoogleAnalytics.tsx`) — pushes til
   `window.dataLayer` (GTM) + `gtag('event', ...)` (GA4 direkte). Sender kun efter
   cookie-consent.
2. **Server-side** via `recordEvent()` (i `lib/db.ts`) — skriver til Neon `events`-tabel
   så `/admin` kan vise tidslinjen.

GA4 events-navne matcher 1:1 med events-typerne i databasen så Sebastian kan krydse
Vercel-deploy-data, GA-rapporter og /admin-dashboardet uden mapping-fejl.

---

## Funnel events (klient-side via `track()`)

| Event | Hvor kaldt | Parametre |
|---|---|---|
| `cvr_started` | CVR-input får første tegn | `source_page` |
| `cvr_submitted` | Klikker "Start analyse" / "Få tilbud" | `cvr`, `redirect_path` |
| `cvr_lookup_skipped` | "Spring over" på fejl-state | — |
| `cvr_lookup_error` | CVR API fejlede | `cvr` |
| `cvr_company_confirmed_view` | Bekræftelses-skærmen vises | `cvr`, `company` |
| `cvr_step_actions_view` | Trin 3 (klargør analyse) vises | — |
| `cvr_flow_completed` | Hele /analyse er gennemført | `company`, `auth_method`, `files_uploaded` |
| `cvr_contact_submitted` | Submit fyrer fra /analyse | `has_phone`, `auth_method`, `files_uploaded` |
| `cvr_contact_error` | Fejl i submit | — |
| `sign_dialog_opened` | SignDialog åbnes | `company`, `cvr` |
| `sign_completed` | Underskrift sendt succesfuldt | `company`, `cvr`, `insurers_count`, `audit_id` |
| `analyse_completed` | Hele /analyse gennemført inkl. submit | `files_count`, `signed`, `cvr`, `company` |
| `contact_submitted` | /kontakt-os submit succesfuld | `has_phone`, `has_company`, `topic` |
| `contact_error` | /kontakt-os submit fejlede | — |
| `hero_submitted` | Forside hero-form succesfuld | `has_cvr`, `has_phone` |
| `hero_error` | Forside hero-form fejlede | — |
| `hole_in_one_submitted` | Hole-in-one-form submit | `cvr` |
| `hole_in_one_prefilled` | CVR auto-fyldte hole-in-one-form | `cvr` |
| `hole_in_one_completed` | Hele hole-in-one-flow færdigt | `cvr`, `praemie_vaerdi`, `klubnavn` |

---

## Server-side events (Neon `events`-tabel)

| Event-type | Skriver hvor | Beskrivelse |
|---|---|---|
| `sign_completed` | `/api/sign` | Lead oprettes + event registreres ved underskrift |
| `kontakt_submitted` | `/api/contact` | /kontakt-os submission |
| `hero_submitted` | `/api/contact` | Forside hero submission |
| `analyse_completed` | `/api/contact` | /analyse fuldt flow gennemført (med fuldmagt) |
| `analyse_submitted` | `/api/contact` | /analyse submit uden fuldmagt |
| `hole_in_one_submitted` | `/api/contact` | /tilbud/hole-in-one submit |
| `status_changed` | `/api/admin/leads/[id]/status` | Manuel status-update fra Sebastian |
| `abandoned_lead_mailed` | `/api/cron/abandoned-leads` | Frafaldent flow sendt videre som lead |
| `abandoned_lead_created` | `/api/cron/abandoned-leads` | Markerer sessionen, så den kun sendes én gang |

Hver event har `lead_id` der knytter den til den underliggende lead-row så `/admin/leads/[id]`
kan vise hele tidslinjen. `abandoned_lead_created` hænger på `session_id` i stedet, da den
markerer selve flowet.

---

## Frafaldne flows bliver til leads

Indtaster nogen CVR og/eller kontaktoplysninger uden at underskrive fuldmagten, er der stadig
et lead: enten har vi personens mail/telefon, eller også har vi CVR og kan ringe til
virksomheden. `/api/cron/abandoned-leads` opretter derfor et lead (kilde `frafald`, status `new`)
og sender en almindelig lead-mail til `CONTACT_TO_EMAIL` — én mail pr. virksomhed, beriget med
adresse og offentligt telefonnummer fra CVR-registret.

Tre indgange, samme dedup (`abandoned_lead_created` pr. session):

| Indgang | Hvornår | Kræver |
|---|---|---|
| `?session=<id>` | ~20 min efter CVR/kontakt via QStash | `QSTASH_TOKEN` + `CRON_SECRET` |
| ingen parametre | dagligt kl. 07:00 (Vercel-cron), backstop | — |
| `?backfill=1` | manuelt, ét års horisont | `CRON_SECRET` |

`?dry=1` viser hvem der ville blive sendt uden at sende eller markere noget.

Kunden får **ingen** mail — de trykkede aldrig send. Mailen til Nordan siger tydeligt at
fuldmagten mangler, så ingen tror der er samtykke til at indhente policer.

Har vi kun CVR og ingen mailadresse, gemmes leadet under en pladsholder
(`cvr-<cvr>@ukendt.invalid`), fordi `leads.email` er NOT NULL og bruges som dedup-nøgle.
Admin viser dem som "Kun CVR".

---

## GTM-konfiguration

GA4-tag er aktiv via `app/_components/GoogleAnalytics.tsx`. Hvis Sebastian vil have GTM
på toppen af GA, kan han tilføje GTM-container ID som env var og indsætte loader-script
i `app/layout.tsx`. Alle events ligger allerede i `dataLayer`, så GTM vil fange dem uden
yderligere kodeændringer.

GTM trigger-eksempler:

- **Goal: Lead modtaget**: Custom event = `contact_submitted` ELLER `hero_submitted` ELLER `analyse_completed` ELLER `hole_in_one_completed`
- **Goal: Underskrift**: Custom event = `sign_completed`
- **Goal: Højværdig kunde**: Custom event = `analyse_completed` AND `signed = true`

---

## Vigtigt om consent

Alle events sendes kun hvis brugeren har accepteret cookies (set i `localStorage` af
`CookieBanner.tsx`). Pre-consent køes events i `dataLayer` og forbruges når GA4 loader
efter consent-knap-klik.

Server-side `recordEvent()` har INGEN consent-gate — det er førstepartsdata til drift,
ikke marketing. GDPR-mæssigt er det dækket af "berettiget interesse" (vi gemmer kun
data brugeren aktivt har indsendt via formular).
