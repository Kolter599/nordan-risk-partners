# Source Assets

Originale, ukomprimerede billeder. **Vises ikke direkte på sitet.** Brug filerne her som kilde når du skal udskifte/optimere noget i `public/images/`.

## Struktur

- `photos/` — Originale fotos af Mads, Leo, kontoret, og Unsplash-kilder. Disse bliver komprimeret/skåret til og kopieret ind i `public/images/` ved navnet brugt i koden (fx `nordan-12.jpg`, `team-leo.jpg`).
- `logos/` — Forsikringsselskab-logoer i fuld opløsning. Mads' nye sæt fra 3. maj 2026 ligger her. Når et logo opdateres skal det også kopieres til `public/images/insurers/` med det filnavn der bruges i `app/_components/InsurerMarquee.tsx` (fx `viking.png`, `allianz.png`).

## Workflow

1. Læg nye originaler i den rigtige undermappe her
2. Optimér og kopiér til `public/images/...` med korrekt filnavn
3. Behold originalen i `source-assets/` så vi altid kan re-eksportere

## Noter om logo-opløsning

Logoer der **stadig er lavoplsning** og bør udskiftes når der findes bedre versioner: QBE (104×29), AIG, Chubb, Gjensidige, Lloyd's, Zurich, AXA, Tryg — alle 250px brede eller mindre.
