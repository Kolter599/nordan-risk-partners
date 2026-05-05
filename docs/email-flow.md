# Email-flow logic tree

Beskriver præcist hvilke mails der sendes hvornår, fra hvilket flow, og hvordan duplikater undgås.

Alle mails sendes via Resend (`info@ndrp.dk`). Interne mails (til Mads) er
plain forward-friendly. Eksterne mails (til kunden) er fuldt brandede.

---

## Touchpoints

```
1. /kontakt-os ContactForm        → /api/contact
2. Forside HomeContactForm        → /api/contact
3. /tilbud/hole-in-one (CVR-flow) → /api/contact
4. /analyse (CvrLookup, fuldt flow)
   ├─ Underskrift                 → /api/sign  (planlægger fallback-mails)
   └─ Send & start analyse        → /api/contact (cancel + consolidated)
```

---

## /api/contact — generel logik

```
INDKOMMENDE REQUEST
│
├─ Validér payload (navn + valid email + besked)
│  └─ FEJL? → 400 + stop
│
├─ Resend API key konfigureret?
│  └─ NEJ → log submission til Vercel logs, returnér ok=true (graceful)
│
├─ cancelEmailIds[] tilstede?
│  └─ JA → for hver: Resend.emails.cancel(id)
│         (best-effort — fejler stille hvis allerede afsendt)
│
├─ Send INTERN mail til info@ndrp.dk
│  ├─ Subject: "Ny henvendelse fra <navn> (<firma>) [· N filer]"
│  ├─ Plain HTML, ingen logo/footer
│  ├─ Hvis signedFuldmagt → tilføj "Underskrevet fuldmagt"-blok m. blob-link
│  └─ ReplyTo: kundens email (Mads kan svare direkte)
│
└─ sendCustomerConfirmation (default true)?
   └─ JA → Send BEKRÆFTELSE til kunden
          ├─ Subject: "Vi har modtaget din henvendelse — Nordan Risk Partners"
          ├─ Brandet template (logo, footer)
          ├─ Bruger customerMessage (kunde-venlig opsummering)
          ├─ ALDRIG topic eller message-internt-format
          ├─ Hvis signedFuldmagt → "✓ Din underskrevne fuldmagt er modtaget"
          └─ ReplyTo: info@ndrp.dk
```

---

## /api/sign — digital underskrift

```
INDKOMMENDE REQUEST (navn, titel, email, firma, CVR, samtykke)
│
├─ Validér felter + alle 3 samtykke-checkboxes
│  └─ FEJL? → 400 + stop
│
├─ Generér audit (uuid, timestamp, IP, UA, doc hash)
│
├─ Byg PDF (lib/fuldmagt-pdf.ts)
│  ├─ Logo header + fuldmagts-tekst
│  ├─ Underskriver-blok m. typed name in italic
│  └─ Audit-side (audit ID, hash, IP, UA)
│
├─ BLOB_READ_WRITE_TOKEN sat?
│  ├─ JA → Upload PDF til Blob, gem URL
│  └─ NEJ → Skip (PDF lever kun i mail-attachment)
│
├─ RESEND_API_KEY sat?
│  ├─ NEJ → Log + skip mails (PDF lever stadig i Blob hvis konfigureret)
│  └─ JA → PLANLÆG to mails 10 min ud i fremtiden
│         med scheduledAt: 'in 10 minutes'
│         │
│         ├─ Intern fallback (til info@ndrp.dk)
│         │  ├─ Subject: "Underskrevet fuldmagt (uafsluttet flow) · ..."
│         │  ├─ "Kunde nåede ikke at uploade policer — overvej at følge op"
│         │  └─ PDF som attachment + Blob-link
│         │
│         └─ Underskriver-fallback (til kunde)
│            ├─ Subject: "Din underskrevne undersøgelsesfuldmagt"
│            ├─ Soft nudge: "Vend tilbage til /analyse for at uploade policer"
│            └─ PDF som attachment
│
└─ RETURNÉR til client:
   { auditId, signedAt, blobUrl, scheduledEmailIds: { internal, signer } }
```

---

## /analyse fuldt flow — stitching

```
TIDSAKSE
│
0:00  Kunde klikker "Underskriv elektronisk →"
│
0:01  SignDialog → /api/sign
│     │
│     ├─ PDF genereret + uploaded til Blob
│     ├─ TO mails planlagt 10 min ud (scheduledEmailIds)
│     └─ Returnér { auditId, blobUrl, scheduledEmailIds } til CvrLookup
│
│     CvrLookup gemmer digitalResult i state
│
│     ───── BRANCH A: Kunde færdiggør indenfor 10 min ─────
│
4:30  Kunde uploader policer + klikker "Send & start analyse"
│
4:31  CvrLookup → /api/contact med:
│     │
│     ├─ signedFuldmagt: { auditId, blobUrl, signedAt }
│     ├─ cancelEmailIds: [internal_id, signer_id]
│     └─ files: [...uploaded]
│
4:32  /api/contact:
│     │
│     ├─ Resend.emails.cancel(internal_id) ✓
│     ├─ Resend.emails.cancel(signer_id) ✓
│     ├─ Send INTERN mail til Mads (alt info + fuldmagt-link + policer)
│     └─ Send BEKRÆFTELSE til kunde (kontakt-info + opsummering)
│
RESULTAT: 2 mails total (1 til Mads, 1 til kunde) — alt samlet
│
│     ───── BRANCH B: Kunde forsvinder efter underskrift ─────
│
10:00 (Resend planlagt tid nået, ingen cancellation)
│
10:01 Resend leverer:
│     ├─ Intern fallback til Mads ("uafsluttet flow") + PDF attached
│     └─ Signer fallback til kunde ("vend tilbage og upload policer") + PDF
│
RESULTAT: 2 mails total (begge fuldmagt-only) — vi mister ikke fuldmagten
```

---

## Edge cases

```
Kunde klikker "Send & start analyse" 11+ minutter efter underskrift
│
├─ /api/contact prøver at cancellere planlagte mails
├─ Resend.emails.cancel() returnerer fejl (allerede afsendt)
├─ Vi logger fejlen og fortsætter
└─ Kunde får BÅDE fallback-mailen (afsendt T+10) OG den consolidated mail
   ⇒ Lille uskønhed, men ingen data tabt
```

```
RESEND_API_KEY mangler
│
├─ /api/sign: PDF gemmes i Blob, ingen mails. Returnerer ok=true.
├─ /api/contact: Submission logget til Vercel logs, returnerer ok=true.
└─ Kunde-flow virker stadig visuelt; admin kan se manglende key i logs
```

```
BLOB_READ_WRITE_TOKEN mangler
│
├─ /api/sign: PDF kun i email-attachment, ingen permanent kopi.
├─ /api/contact policer-upload fra /analyse:
│  ├─ Forsøger Blob-upload pr. fil
│  ├─ Hvis fejler: fallback til multipart inline (op til 4 MB total)
│  └─ Hvis over 4 MB: udeladt, mail noterer "Bed kunden eftersende"
└─ Resend leverer stadig mailene
```

```
Kunde klikker "Underskriv igen" efter første underskrift
│
├─ digitalResult overskrives med nyt resultat fra ny /api/sign-call
├─ Den FØRSTE planlagte mail bliver IKKE cancelled (vi mister ID)
└─ Kunde kan modtage 2 fallback-mails hvis de ikke fuldfører
   ⇒ Acceptabelt — sjældent edge case, ingen data tabt
   ⇒ Kunne fixes ved at cancellere gammel før ny /api/sign-call
```

---

## Hvilke mails går til hvem

| Trigger                           | Til Mads (info@ndrp.dk) | Til kunde |
|-----------------------------------|--------------------------|-----------|
| /kontakt-os submit                | ✓ intern                 | ✓ bekræftelse |
| Forside hero-form submit          | ✓ intern                 | ✓ bekræftelse |
| /tilbud/hole-in-one submit        | ✓ intern                 | ✓ bekræftelse |
| /analyse: kun underskrift         | ✓ planlagt T+10min       | ✓ planlagt T+10min |
| /analyse: underskrift + send      | ✓ konsolideret           | ✓ konsolideret |
| /analyse: send uden underskrift   | ✓ intern (uden fuldmagt) | ✓ bekræftelse |

---

## Når noget skal ændres

- **Tidsforsinkelsen**: ændr `scheduledAt: "in 10 minutes"` i `app/api/sign/route.ts`
- **Mail-templates**: brandet shell ligger i `lib/email-template.ts`, route-specifik HTML inline
- **Subject-linjer**: hardkodet i hver route — søg efter `subject:` i `/api/contact` og `/api/sign`
- **Afsender**: env var `MAIL_FROM` (default `Nordan Risk Partners <info@ndrp.dk>`)
- **Modtager**: env var `CONTACT_TO_EMAIL` (default `info@ndrp.dk`)
