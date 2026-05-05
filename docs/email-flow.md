# Email-flow logic tree

Beskriver præcist hvilke mails der sendes hvornår, fra hvilket flow, og hvordan de threades.

Alle mails sendes via Resend (`info@ndrp.dk`). Interne mails (til Mads) er
plain forward-friendly. Eksterne mails (til kunden) er fuldt brandede.

---

## Touchpoints

```
1. /kontakt-os ContactForm        → /api/contact
2. Forside HomeContactForm        → /api/contact
3. /tilbud/hole-in-one (CVR-flow) → /api/contact
4. /analyse (CvrLookup, fuldt flow)
   ├─ Underskrift                 → /api/sign  (sender med Message-ID)
   └─ Send & start analyse        → /api/contact (sender som Re: med In-Reply-To)
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
├─ signedFuldmagt med Message-IDs tilstede?
│  ├─ JA → subject = "Re: <original sign subject>"
│  │       headers = { In-Reply-To, References } → email-clients threader
│  └─ NEJ → normal subject ("Ny henvendelse fra ...")
│
├─ Send INTERN mail til info@ndrp.dk
│  ├─ Plain HTML, ingen logo/footer
│  ├─ Hvis signedFuldmagt → tilføj "Underskrevet fuldmagt"-blok m. blob-link
│  └─ ReplyTo: kundens email
│
└─ sendCustomerConfirmation (default true)?
   └─ JA → Send BEKRÆFTELSE til kunden
          ├─ Subject = "Re: <sign receipt subject>" hvis tidligere underskrevet,
          │           ellers "Vi har modtaget din henvendelse — Nordan Risk Partners"
          ├─ headers = { In-Reply-To, References } hvis threading
          ├─ Brandet template (logo, footer)
          ├─ Bruger customerMessage (kunde-venlig opsummering)
          ├─ ALDRIG topic eller message-internt-format
          └─ ReplyTo: info@ndrp.dk
```

---

## /api/sign — digital underskrift

```
INDKOMMENDE REQUEST (navn, titel, email, telefon, firma, CVR, insurers, samtykke)
│
├─ Validér felter + alle 3 samtykke-checkboxes + telefon
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
│  └─ JA → SEND STRAKS — to mails:
│         │
│         ├─ Intern mail (til info@ndrp.dk)
│         │  ├─ Subject: "Underskrevet fuldmagt · Acme ApS (CVR ...)"
│         │  ├─ Headers: { Message-ID: <internal-{auditId}@nordanriskpartners.dk> }
│         │  ├─ Indhold: signer info + telefon + insurers (hvis valgt)
│         │  └─ PDF som attachment + Blob-link
│         │
│         └─ Underskriver-kvittering (til kunde)
│            ├─ Subject: "Din underskrevne undersøgelsesfuldmagt — Nordan Risk Partners"
│            ├─ Headers: { Message-ID: <receipt-{auditId}@nordanriskpartners.dk> }
│            └─ PDF som attachment
│
└─ RETURNÉR til client:
   { auditId, signedAt, blobUrl, internalMessageId, receiptMessageId,
     internalSubject, receiptSubject, insurers }
```

---

## /analyse fuldt flow — stitching via threading

```
TIDSAKSE
│
0:00  Kunde klikker "Underskriv elektronisk →"
│
0:01  SignDialog → /api/sign (med navn, telefon, insurers, samtykke)
│     │
│     ├─ PDF genereret + uploadet til Blob
│     ├─ Internal mail SENDT NU til info@ndrp.dk med Message-ID
│     ├─ Kvittering SENDT NU til signer med Message-ID
│     └─ Returnér { auditId, blobUrl, internalMessageId, receiptMessageId, ... }
│
│     CvrLookup gemmer digitalResult i state
│
│     ───── BRANCH A: Kunde færdiggør indenfor kort tid ─────
│
4:30  Kunde uploader policer + klikker "Send & start analyse"
│
4:31  CvrLookup → /api/contact med:
│     │
│     └─ signedFuldmagt: { auditId, blobUrl, internalMessageId, receiptMessageId,
│                          internalSubject, receiptSubject, insurers, signedAt }
│
4:32  /api/contact:
│     │
│     ├─ Send INTERN mail som "Re: Underskrevet fuldmagt · Acme ApS (CVR ...)"
│     │  med In-Reply-To: <internal-{auditId}@nordanriskpartners.dk>
│     │  ⇒ Outlook/Gmail threader denne mail UNDER den fra T=0
│     │
│     └─ Send BEKRÆFTELSE som "Re: Din underskrevne undersøgelsesfuldmagt"
│        med In-Reply-To: <receipt-{auditId}@nordanriskpartners.dk>
│        ⇒ Kundens mail-klient threader også
│
RESULTAT: 4 mails total, men de threader så Mads ser ÉN samtale per kunde
│
│     ───── BRANCH B: Kunde forsvinder efter underskrift ─────
│
∞     Ingen yderligere mails. Mads har stadig fået den underskrevne fuldmagt
      + telefon + insurers — han kan kontakte kunden direkte.
      Kunden har stadig fået sin kvittering.
│
RESULTAT: 2 mails total (de to fra T=0).
```

---

## Threading kontrakt

For at threading virker korrekt skal følgende headers sættes:

| Mail | Custom header | Værdi |
|---|---|---|
| `/api/sign` intern | `Message-ID` | `<internal-{auditId}@nordanriskpartners.dk>` |
| `/api/sign` kvittering | `Message-ID` | `<receipt-{auditId}@nordanriskpartners.dk>` |
| `/api/contact` intern (når signedFuldmagt findes) | `In-Reply-To` + `References` | samme værdi som ovenfor |
| `/api/contact` kvittering (når signedFuldmagt findes) | `In-Reply-To` + `References` | samme værdi som ovenfor |

Subject prefix:
- Original sign-mail: `"Underskrevet fuldmagt · ..."`
- Follow-up fra /api/contact: `"Re: Underskrevet fuldmagt · ..."`

Outlook/Gmail bruger Message-ID matching som primær thread-signal med subject som tiebreaker.

---

## Edge cases

```
Kunde klikker "Underskriv igen" efter første underskrift
│
├─ Ny /api/sign-call genererer nyt auditId og nye Message-IDs
├─ Mads får 2 sign-mails (en pr. underskrift) — de threader IKKE sammen
└─ Kunden får også 2 kvitteringer
   ⇒ Acceptabelt — sjælden adfærd, ingen data tabt
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

---

## Hvilke mails går til hvem

| Trigger                              | Til Mads (info@ndrp.dk)   | Til kunde |
|--------------------------------------|----------------------------|-----------|
| /kontakt-os submit                   | ✓ intern                   | ✓ bekræftelse |
| Forside hero-form submit             | ✓ intern                   | ✓ bekræftelse |
| /tilbud/hole-in-one submit           | ✓ intern                   | ✓ bekræftelse |
| /analyse: kun underskrift            | ✓ sign-mail STRAKS         | ✓ kvittering STRAKS |
| /analyse: send efter underskrift     | ✓ Re: i samme tråd         | ✓ Re: i samme tråd |
| /analyse: send uden underskrift      | ✓ intern (ingen threading) | ✓ bekræftelse |

---

## Hvor man tweaker hvad

- **Threading**: Message-ID-prefix sættes i `app/api/sign/route.ts` (`messageIdFor` helper)
- **Mail-templates**: brandet shell ligger i `lib/email-template.ts`, route-specifik HTML inline
- **Subject-linjer**: hardkodet i hver route — søg efter `subject:` eller `internalSubject` / `receiptSubject`
- **Insurer-liste i SignDialog**: `INSURER_OPTIONS` array i `app/_components/SignDialog.tsx`
- **Afsender**: env var `MAIL_FROM` (default `Nordan Risk Partners <info@ndrp.dk>`)
- **Modtager**: env var `CONTACT_TO_EMAIL` (default `info@ndrp.dk`)
