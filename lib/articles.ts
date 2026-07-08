/**
 * Editorial article catalog. Each article renders through a shared
 * template at /artikler/[slug], is listed on the /artikler hub, and is
 * included in the sitemap so Google indexes them — capturing long-tail,
 * decision-stage and competitor-adjacent search traffic while keeping the
 * core site visually focused.
 */

export type ArticleSection =
  | { type: "paragraph"; body: string }
  | { type: "lead"; body: string }
  | { type: "heading"; level: 2 | 3; body: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; eyebrow?: string; title?: string; body: string };

/** Editorial grouping used by the /artikler hub. */
export type ArticleCategory = "marked" | "guide" | "alternativ";

/** A single internal cross-link rendered at the foot of an article. */
export type ArticleLink = { label: string; href: string };

export type Article = {
  slug: string;
  /** Document <title> + H1 candidate. */
  title: string;
  /** Subheadline shown under the H1 in the hero. */
  deck: string;
  /** SEO meta description (≤ 160 chars recommended). */
  metaDescription: string;
  /** Editorial grouping for the /artikler hub. Defaults to "marked". */
  category?: ArticleCategory;
  /** Per-article <meta keywords>. Falls back to a generic broker set. */
  keywords?: string[];
  /** OpenGraph article:tag values. Falls back to a generic set. */
  ogTags?: string[];
  /** schema.org Article `about` topics. Falls back to a generic set. */
  aboutTopics?: string[];
  /** Internal cross-links rendered at the article foot (link equity + UX). */
  relatedLinks?: ArticleLink[];
  /** Hero photo (under public/images). */
  heroImage: string;
  /** Author byline shown under the meta strip. */
  author: string;
  /** ISO date the article was first published. */
  publishedAt: string;
  /** Estimated read time, e.g. "5 min". */
  readingTime: string;
  /** Body — alternates paragraphs, headings, lists, callouts. */
  body: ArticleSection[];
  /** A short, attribution-only source note shown at the foot of the article.
   *  We deliberately do NOT link out — we want the link juice to stay on
   *  the page. */
  sourceNote?: string;
  /** Slug of related insurance product page that should be cross-linked. */
  relatedProductSlug?: string;
  /** Heading + body for the related-product callout. */
  relatedProductCta?: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
  /** Custom label for the in-article CVR capture. */
  cvrLabel?: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "naar-160-procent-ikke-laengere-er-usaedvanligt",
    title: "Når 160% ikke længere er usædvanligt",
    deck:
      "Forsikringsmarkedet for fredede ejendomme er under pres — og ejerne mærker det nu",
    metaDescription:
      "Præmiestigninger på 160% er ikke længere usædvanlige for fredede ejendomme. Halvdelen af ansøgninger afvises, og selskaberne trækker sig. Få indblik i markedet og hvad ejere kan gøre.",
    category: "marked",
    keywords: [
      "forsikring fredede ejendomme",
      "fredet ejendom forsikring",
      "præmiestigning fredede bygninger",
      "forsikringsmægler fredede ejendomme",
      "forsikring fredet bygning afslag",
      "fredet bygning forsikringssum",
      "Slots- og Kulturstyrelsen forsikring",
      "Historiske Huse forsikring",
      "førsterisikoforsikring fredet ejendom",
      "Nordan Risk Partners",
    ],
    ogTags: ["fredede ejendomme", "forsikring", "forsikringsmægler", "præmiestigning", "kulturarv"],
    aboutTopics: [
      "Forsikring af fredede ejendomme",
      "Forsikringsmægler",
      "Bevaringsværdige bygninger",
    ],
    heroImage: "/images/fredede-ejendomme-160-procent.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-05-21",
    readingTime: "6 min",
    cvrLabel: "Få en uforpligtende vurdering af jeres fredede ejendom",
    relatedProductSlug: "fredede-ejendomme-forsikring",
    relatedProductCta: {
      eyebrow: "Specialrådgivning",
      headline: "Vi har set markedet for fredede ejendomme indefra",
      body:
        "Få en uforpligtende vurdering af jeres fredede ejendom — selv hvis I allerede har fået nej hos andre selskaber.",
      buttonLabel: "Få gratis vurdering",
    },
    sourceNote:
      "Artiklen bygger blandt andet på markedsobservationer og oplysninger fra Historiske Huse om udviklingen for forsikring af fredede og bevaringsværdige ejendomme.",
    body: [
      {
        type: "lead",
        body:
          "For nylig delte vi et opslag på LinkedIn om en fredet ejendom, der stod overfor en præmiestigning på 160%. Responsen var markant — ikke fordi tallet overraskede os, men fordi mange ejere af fredede og bevaringsværdige ejendomme efterhånden oplever det samme.",
      },
      {
        type: "paragraph",
        body:
          "Det, der for få år siden ville have virket ekstremt, er i dag blevet en reel markedsudvikling. Og problemet er større end bare dyrere forsikringer. Det handler om et marked, hvor appetitten på fredede bygninger er blevet markant mindre, hvor færre selskaber ønsker risikoen, og hvor mange ejendomsejere i praksis står tilbage med meget begrænsede muligheder.",
      },
      { type: "heading", level: 2, body: "Et marked med færre selskaber og større usikkerhed" },
      {
        type: "paragraph",
        body:
          "Organisationen Historiske Huse har selv beskrevet udviklingen som kritisk. De peger blandt andet på:",
      },
      {
        type: "list",
        items: [
          "Kraftige præmiestigninger",
          "Færre selskaber der ønsker at tegne risikoen",
          "Flere afvisninger",
          "Usikkerhed omkring genopførelse efter større skader",
          "Udfordringer med korrekte forsikringssummer",
        ],
      },
      {
        type: "paragraph",
        body:
          "Ifølge Historiske Huse bliver omkring halvdelen af alle ansøgninger om forsikring af fredede bygninger i dag afvist, og nogle ejere oplever præmiestigninger på op mod 100% eller mere. Det er ikke længere et nicheproblem — det er en strukturel udfordring i markedet.",
      },
      { type: "heading", level: 2, body: "Hvorfor er fredede ejendomme blevet så svære at forsikre?" },
      {
        type: "paragraph",
        body:
          "Mange tror fejlagtigt, at det alene handler om alder på bygningen. Det gør det ikke. Udfordringen opstår typisk i kombinationen af:",
      },
      {
        type: "list",
        items: [
          "Fredningskrav",
          "Specialmaterialer",
          "Begrænsede håndværkerkompetencer",
          "Høj genopførelsesusikkerhed",
          "Kompleks skadeshåndtering",
          "Store potentielle brandskader",
        ],
      },
      {
        type: "paragraph",
        body:
          "Når en fredet bygning bliver ramt af en større skade, er det ikke nødvendigvis forsikringsselskabet alene, der afgør, hvordan bygningen skal genetableres. Her spiller Slots- og Kulturstyrelsen ofte en central rolle i forhold til krav om materialer, metoder og restaurering.",
      },
      {
        type: "paragraph",
        body:
          "Det betyder i praksis, at en skade kan udvikle sig markant dyrere end ved en almindelig ejendom. Og netop usikkerheden omkring de fremtidige omkostninger gør mange selskaber tilbageholdende.",
      },
      { type: "heading", level: 2, body: "Problemet med førsterisikosummer" },
      {
        type: "paragraph",
        body:
          "En anden udfordring, vi ofte møder i markedet, er spørgsmålet om førsterisikosummer. Mange fredede bygninger er i dag ikke forsikret til fuld genopførelsesværdi, men via en såkaldt førsterisikoforsikring. Det betyder, at ejeren selv fastsætter den maksimale forsikringssum, der kan komme til udbetaling ved en større skade.",
      },
      {
        type: "callout",
        eyebrow: "Det ubehagelige spørgsmål",
        title: "Hvem står med regningen, hvis summen ikke er tilstrækkelig?",
        body:
          "Det kan være nødvendigt at acceptere en førsterisikosum for overhovedet at få en løsning i markedet. Men det skaber et vigtigt spørgsmål om risikoplacering, som vi mener fylder alt for lidt i markedet lige nu.",
      },
      { type: "heading", level: 2, body: "Vi ser flere og flere cases" },
      { type: "paragraph", body: "Vi oplever i øjeblikket:" },
      {
        type: "list",
        items: [
          "Ejere der får varslet stigninger på 60–200%",
          "Selskaber der reducerer dækninger",
          "Højere selvrisici",
          "Begrænsninger på vand-, råd- og svampedækninger",
          "Krav om omfattende risikoforbedringer",
          "Manglende konkurrence ved udbud",
        ],
      },
      {
        type: "paragraph",
        body:
          "Særligt større ældre ejendomme, herregårde, møller, hoteller og ejendomme med høj kulturhistorisk værdi er blevet hårdt ramt. Flere medier har allerede beskrevet udviklingen — blandt andet historier om fredede ejendomme på Djursland, hvor ejerne oplever markante udfordringer med både forsikring og økonomi omkring vedligeholdelse.",
      },
      { type: "heading", level: 2, body: "Det kræver specialviden — ikke standardløsninger" },
      {
        type: "paragraph",
        body:
          "Efter vores opfattelse er markedet nået til et punkt, hvor fredede ejendomme ikke længere kan håndteres som almindelige erhvervsejendomme. Det kræver:",
      },
      {
        type: "list",
        items: [
          "Forståelse for fredningsforhold",
          "Kendskab til selskabernes reelle appetit",
          "Dialog om korrekte forsikringssummer",
          "Gennemgang af policetekster og klausuler",
          "Forståelse for genopførelsesproblematikker",
          "Aktiv markedsafdækning — også uden for standardmarkedet",
        ],
      },
      {
        type: "paragraph",
        body:
          "Mange ejere opdager først udfordringerne, når tilbuddet lander på bordet kort før fornyelse. På det tidspunkt er mulighederne ofte begrænsede.",
      },
      { type: "heading", level: 2, body: "Vores oplevelse hos Nordan Risk Partners" },
      {
        type: "paragraph",
        body:
          "Hos Nordan Risk Partners arbejder vi intensivt med forsikring af fredede og bevaringsværdige ejendomme. Ikke fordi markedet er nemt — men netop fordi det er svært.",
      },
      { type: "paragraph", body: "Vi oplever, at mange ejere savner:" },
      {
        type: "list",
        items: [
          "Sparring omkring forsikringssummer",
          "Reelt markedstjek",
          "Gennemsigtighed omkring dækninger",
          "Specialiseret rådgivning",
          "En partner, der forstår kompleksiteten i fredede bygninger",
        ],
      },
      {
        type: "paragraph",
        body:
          "Markedet ændrer sig hurtigt i disse år. Og når præmiestigninger på 160% ikke længere skaber chok i branchen, fortæller det måske meget godt, hvor presset området reelt er blevet.",
      },
    ],
  },

  // ── GUIDE ────────────────────────────────────────────────────────────
  {
    slug: "forsikringsmaegler-eller-forsikringsselskab",
    title: "Forsikringsmægler eller direkte til forsikringsselskabet?",
    deck:
      "Skal virksomheden tegne forsikring direkte hos selskabet — eller lade en uafhængig mægler stå for det? Her er forskellen, fordelene og ulemperne.",
    metaDescription:
      "Forsikringsmægler eller direkte til selskabet? Vi gennemgår forskellen på de to veje, hvad du får med en uafhængig mægler, og hvornår det giver mening for din virksomhed.",
    category: "guide",
    keywords: [
      "forsikringsmægler eller forsikringsselskab",
      "hvad er forskellen på mægler og selskab",
      "fordele ved forsikringsmægler",
      "uafhængig forsikringsmægler",
      "erhvervsforsikring uden mægler",
      "forsikringsmægler erhverv",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "forsikringsselskab", "erhvervsforsikring", "rådgivning"],
    aboutTopics: ["Forsikringsmægler", "Forsikringsselskab", "Erhvervsforsikring"],
    heroImage: "/images/nordan-52.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-06-11",
    readingTime: "6 min",
    cvrLabel: "Få en uforpligtende gennemgang af jeres forsikringer",
    relatedLinks: [
      { label: "Hvorfor bruge en forsikringsmægler?", href: "/hvorfor-forsikringsmaegler" },
      { label: "Sådan arbejder vi", href: "/saadan-arbejder-vi" },
      { label: "Se alle erhvervsforsikringer", href: "/erhvervsforsikringer" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Når en virksomhed skal have styr på sine forsikringer, er der grundlæggende to veje: tegne policerne direkte hos et forsikringsselskab, eller lade en uafhængig forsikringsmægler stå for rådgivning, udbud og løbende sparring. Begge dele kan fungere — men de løser ikke helt den samme opgave.",
      },
      {
        type: "paragraph",
        body:
          "Vælger man selskabet direkte, får man én leverandørs produkter og priser. Vælger man mægleren, får man en rådgiver, der arbejder for virksomheden og afdækker markedet på tværs af selskaberne. Forskellen lyder lille, men den har stor betydning for både dækning og pris.",
      },
      { type: "heading", level: 2, body: "Hvad gør et forsikringsselskab?" },
      {
        type: "paragraph",
        body:
          "Et forsikringsselskab udvikler, sælger og udbetaler på egne policer. Det er en effektiv vej, hvis man præcist ved, hvad man har brug for, og gerne selv vil holde styr på vilkår, summer og fornyelser. Men selskabets rådgiver repræsenterer selskabet — ikke virksomheden. Sammenligning med markedet, forhandling af vilkår og et kritisk blik på egne policer ligger uden for den rolle.",
      },
      { type: "heading", level: 2, body: "Hvad gør en forsikringsmægler?" },
      {
        type: "paragraph",
        body:
          "En uafhængig forsikringsmægler arbejder for kunden. Vi kortlægger virksomhedens reelle risici, oversætter dem til en dækningsstruktur, sender programmet i udbud hos flere selskaber og forhandler vilkår og pris. Herefter følger vi op løbende — ved fornyelser, ændringer i virksomheden og ikke mindst når der sker en skade.",
      },
      {
        type: "list",
        items: [
          "Uvildig afdækning af markedet på tværs af selskaber",
          "Forhandling af både pris og policetekst",
          "Gennemgang af eksisterende policer for huller og dobbeltdækning",
          "Bisidder ved skader, hvor det gælder om at få den rette udbetaling",
          "Én fast kontakt frem for skiftende call-centre",
        ],
      },
      {
        type: "callout",
        eyebrow: "Kort sagt",
        title: "Selskabet sælger dækning — mægleren rådgiver om den",
        body:
          "Det er den centrale forskel. En mægler har ingen egne produkter at sælge og tjener derfor ikke på, at du vælger ét bestemt selskab frem for et andet.",
      },
      { type: "heading", level: 2, body: "Hvad koster det at bruge en mægler?" },
      {
        type: "paragraph",
        body:
          "Mange antager, at et ekstra led automatisk gør forsikringen dyrere. I praksis er billedet ofte det modsatte. Fordi mægleren skaber reel konkurrence om virksomheden, presses prisen — og et skarpere udbud kan i sig selv opveje honoraret. Vi er altid åbne om, hvordan vi honoreres, før samarbejdet begynder.",
      },
      { type: "heading", level: 2, body: "Hvornår giver det direkte valg mening?" },
      {
        type: "paragraph",
        body:
          "For en helt lille virksomhed med enkle, standardiserede behov — for eksempel en basal erhvervsansvarsforsikring — kan det være både hurtigt og fint at gå direkte til et selskab. Jo mere sammensat risikobilledet bliver, jo større bliver værdien af et uvildigt overblik.",
      },
      { type: "heading", level: 2, body: "Hvornår giver mægleren mening?" },
      {
        type: "list",
        items: [
          "Virksomheden har flere policer, der skal spille sammen",
          "Der er specialrisici — cyber, bestyrelsesansvar, transport, fredede ejendomme",
          "Præmierne er steget, og I vil vide, om de er markedskonforme",
          "I mangler tid eller intern forsikringsviden til at forhandle selv",
          "I vil have en professionel bisidder, hvis skaden sker",
        ],
      },
      {
        type: "paragraph",
        body:
          "Er I i tvivl om, hvilken vej der passer til jeres virksomhed, gennemgår vi gerne jeres nuværende program uforpligtende. Så ved I, om der er huller, dobbeltdækning eller penge at hente — uanset om I ender med at bruge en mægler eller ej.",
      },
    ],
  },

  // ── GUIDE ────────────────────────────────────────────────────────────
  {
    slug: "hvad-koster-en-forsikringsmaegler",
    title: "Hvad koster en forsikringsmægler?",
    deck:
      "Honorar, courtage og hvad du reelt betaler for at have en uvildig rådgiver. Sådan er en forsikringsmægler til erhverv skruet sammen økonomisk.",
    metaDescription:
      "Hvad koster en forsikringsmægler? Vi forklarer honorar- og courtagemodellen, hvad du betaler for, og hvorfor en mægler ofte tjener sig selv hjem gennem et skarpere udbud.",
    category: "guide",
    keywords: [
      "hvad koster en forsikringsmægler",
      "forsikringsmægler pris",
      "forsikringsmægler honorar",
      "courtage forsikringsmægler",
      "forsikringsmægler erhverv pris",
      "betaler man for forsikringsmægler",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "honorar", "courtage", "pris", "erhvervsforsikring"],
    aboutTopics: ["Forsikringsmægler", "Honorar", "Erhvervsforsikring"],
    heroImage: "/images/unsplash-business.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-06-18",
    readingTime: "5 min",
    cvrLabel: "Få klar besked om pris og honorar — uforpligtende",
    relatedLinks: [
      { label: "Sådan arbejder vi", href: "/saadan-arbejder-vi" },
      { label: "Hvorfor bruge en forsikringsmægler?", href: "/hvorfor-forsikringsmaegler" },
      { label: "Om Nordan Risk Partners", href: "/om-os" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Det er et af de første spørgsmål, vi får: Hvad koster det egentlig at have en forsikringsmægler? Det korte svar er, at det afhænger af modellen — og at prisen skal ses i forhold til, hvad en skarpere forsikringsløsning er værd for virksomheden.",
      },
      { type: "heading", level: 2, body: "To måder en mægler kan honoreres på" },
      {
        type: "paragraph",
        body:
          "Grundlæggende findes der to modeller. I den ene betaler virksomheden et aftalt honorar direkte til mægleren. I den anden modtager mægleren courtage — en andel, der er indregnet i præmien og afregnes via selskabet. Nogle samarbejder kombinerer de to. Det afgørende er ikke modellen i sig selv, men at den er gennemsigtig og aftalt på forhånd.",
      },
      {
        type: "list",
        items: [
          "Honorar: en fast eller timebaseret pris, virksomheden betaler direkte",
          "Courtage: en andel indregnet i præmien, afregnet via selskabet",
          "Kombination: honorar for rådgivning + courtage på udvalgte policer",
        ],
      },
      {
        type: "callout",
        eyebrow: "Vores princip",
        title: "Du skal altid vide, hvad du betaler — og for hvad",
        body:
          "Uanset model lægger vi honoreringen åbent frem, før samarbejdet starter. Uvildighed er kun reel, når økonomien er gennemsigtig.",
      },
      { type: "heading", level: 2, body: "Hvad betaler du reelt for?" },
      {
        type: "paragraph",
        body:
          "Du betaler ikke for en police — den kommer fra selskabet. Du betaler for arbejdet omkring den: risikoafdækning, markedsudbud, forhandling af vilkår, kvalitetssikring af policeteksten og løbende opfølgning. Og du betaler for at have en professionel bisidder den dag, der sker en skade, og det gælder om at få den rette udbetaling.",
      },
      { type: "heading", level: 2, body: "Tjener en mægler sig selv hjem?" },
      {
        type: "paragraph",
        body:
          "Ofte, ja. Når et forsikringsprogram sendes i reelt udbud, opstår der konkurrence om virksomheden. Det presser præmien og forbedrer vilkårene. For mange virksomheder betyder det, at besparelsen og den bedre dækning mere end opvejer honoraret — samtidig med at de sparer intern tid. Men vi lover aldrig et bestemt tal på forhånd; vi lover en uvildig proces.",
      },
      { type: "heading", level: 2, body: "Er billigst altid bedst?" },
      {
        type: "paragraph",
        body:
          "Nej. En lav præmie er intet værd, hvis dækningen svigter, når skaden sker. Derfor ser vi lige så meget på policeteksten — undtagelser, selvrisici, summer og klausuler — som på prisen. Målet er den rigtige dækning til den rigtige pris, ikke bare den laveste linje på tilbuddet.",
      },
      {
        type: "paragraph",
        body:
          "Vil I have et konkret bud på, hvordan et samarbejde kan skrues sammen for netop jeres virksomhed, tager vi gerne en uforpligtende snak. Så kender I både model og pris, før I beslutter jer.",
      },
    ],
  },

  // ── GUIDE ────────────────────────────────────────────────────────────
  {
    slug: "saadan-vaelger-du-forsikringsmaegler",
    title: "Sådan vælger du den rigtige forsikringsmægler",
    deck:
      "Ni ting, du bør tjekke, før du vælger forsikringsmægler til virksomheden — fra uafhængighed og tilsyn til, hvem der reelt tager telefonen.",
    metaDescription:
      "Sådan vælger du den rigtige forsikringsmægler til erhverv. En tjekliste med de vigtigste kriterier: uafhængighed, Finanstilsynet, specialviden, honorar og skadehjælp.",
    category: "guide",
    keywords: [
      "vælg forsikringsmægler",
      "bedste forsikringsmægler erhverv",
      "hvordan vælger man forsikringsmægler",
      "forsikringsmægler tjekliste",
      "uafhængig forsikringsmægler",
      "forsikringsmægler Finanstilsynet",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "valg", "tjekliste", "erhvervsforsikring"],
    aboutTopics: ["Forsikringsmægler", "Erhvervsforsikring", "Uvildig rådgivning"],
    heroImage: "/images/unsplash-meeting.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-06-25",
    readingTime: "6 min",
    cvrLabel: "Prøv os af — start med en uforpligtende gennemgang",
    relatedLinks: [
      { label: "Om Nordan Risk Partners", href: "/om-os" },
      { label: "Sådan arbejder vi", href: "/saadan-arbejder-vi" },
      { label: "Hvorfor bruge en forsikringsmægler?", href: "/hvorfor-forsikringsmaegler" },
    ],
    body: [
      {
        type: "lead",
        body:
          "En forsikringsmægler bliver ofte en langvarig partner for virksomheden. Derfor er valget ikke ligegyldigt. Her er de kriterier, vi selv ville lægge vægt på, hvis vi sad på den anden side af bordet.",
      },
      { type: "heading", level: 2, body: "1. Er mægleren reelt uafhængig?" },
      {
        type: "paragraph",
        body:
          "En uvildig mægler har ingen ejermæssige bindinger til bestemte forsikringsselskaber og ingen egne produkter at sælge. Spørg direkte: Arbejder I for mig eller for selskaberne? Svaret afgør, hvor frit markedet reelt afdækkes.",
      },
      { type: "heading", level: 2, body: "2. Er virksomheden under tilsyn?" },
      {
        type: "paragraph",
        body:
          "Forsikringsmæglere i Danmark skal være registreret hos Finanstilsynet og efterleve krav om ansvarsforsikring og god skik. Medlemskab af Forsikringsmæglerforeningen er et yderligere kvalitetsstempel. Det er hurtigt at tjekke — og det bør være på plads.",
      },
      { type: "heading", level: 2, body: "3. Har de erfaring med jeres type risici?" },
      {
        type: "paragraph",
        body:
          "En generalist kan håndtere standardforsikringer. Men har virksomheden specialrisici — cyber, bestyrelsesansvar, transport, entreprise eller fredede ejendomme — er reel specialviden afgørende. Bed om konkrete eksempler fra jeres branche.",
      },
      { type: "heading", level: 2, body: "4. Hvem taler du med — og hvor mange gange?" },
      {
        type: "paragraph",
        body:
          "Nogle virksomheder oplever at blive sendt gennem skiftende sagsbehandlere og telefonsluser. Spørg, om I får en fast, erfaren kontaktperson, der kender jeres forretning — også når der ikke lige er en fornyelse på vej.",
      },
      { type: "heading", level: 2, body: "5. Hvordan honoreres de?" },
      {
        type: "paragraph",
        body:
          "En god mægler lægger honorarmodellen — honorar, courtage eller en kombination — åbent frem fra start. Uklarhed om økonomien er et advarselstegn. Gennemsigtighed er en forudsætning for reel uvildighed.",
      },
      { type: "heading", level: 2, body: "6. Læser de policeteksten — ikke kun prisen?" },
      {
        type: "paragraph",
        body:
          "Den billigste præmie er ligegyldig, hvis dækningen svigter ved skade. En dygtig mægler går ned i undtagelser, selvrisici, summer og klausuler. Bed dem forklare, hvor jeres nuværende police har huller.",
      },
      { type: "heading", level: 2, body: "7. Står de ved din side, når skaden sker?" },
      {
        type: "paragraph",
        body:
          "Det er i skadesituationen, en mægler for alvor viser sit værd. Spørg konkret, hvordan de håndterer en skade, og om de agerer bisidder over for selskabet, indtil sagen er afsluttet.",
      },
      { type: "heading", level: 2, body: "8. Kan de forklare tingene forståeligt?" },
      {
        type: "paragraph",
        body:
          "Forsikring er komplekst, men rådgivningen skal ikke være det. En god mægler oversætter til et sprog, ledelsen kan træffe beslutninger på — uden at gemme sig bag paragraffer.",
      },
      { type: "heading", level: 2, body: "9. Passer kemien?" },
      {
        type: "paragraph",
        body:
          "Til sidst et blødt, men vigtigt punkt: I skal kunne tale ligefremt sammen i mange år frem. Tillid og tilgængelighed betyder mere end en glittet præsentation.",
      },
      {
        type: "callout",
        eyebrow: "Vores anbefaling",
        title: "Test mægleren, før I binder jer",
        body:
          "Bed om en uforpligtende gennemgang af jeres nuværende program. Den viser med det samme, om mægleren tænker som en rådgiver — eller som en sælger.",
      },
    ],
  },

  // ── ALTERNATIV ───────────────────────────────────────────────────────
  {
    slug: "alternativ-til-soderberg-partners",
    title: "Alternativ til Söderberg & Partners: uafhængig mægler med direkte adgang",
    deck:
      "Overvejer I Söderberg & Partners til virksomhedens forsikringer? Sådan adskiller en uafhængig boutique-mægler som Nordan Risk Partners sig — og hvornår giver hvad mening.",
    metaDescription:
      "Alternativ til Söderberg & Partners? Nordan Risk Partners er en uafhængig dansk forsikringsmægler med direkte adgang til erfarne rådgivere. Se forskellen — og hvornår hvad passer bedst.",
    category: "alternativ",
    keywords: [
      "alternativ til Söderberg & Partners",
      "Söderberg Partners forsikringsmægler",
      "uafhængig forsikringsmægler erhverv",
      "forsikringsmægler alternativ",
      "dansk forsikringsmægler erhverv",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "Söderberg & Partners", "erhvervsforsikring", "alternativ"],
    aboutTopics: ["Forsikringsmægler", "Erhvervsforsikring", "Uvildig rådgivning"],
    heroImage: "/images/nordan-50.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-07-02",
    readingTime: "5 min",
    cvrLabel: "Få en uforpligtende second opinion på jeres program",
    relatedLinks: [
      { label: "Om Nordan Risk Partners", href: "/om-os" },
      { label: "Sådan arbejder vi", href: "/saadan-arbejder-vi" },
      { label: "Se alle erhvervsforsikringer", href: "/erhvervsforsikringer" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Söderberg & Partners er et velkendt og kompetent navn på det danske marked for pension og forsikring — en af de største aktører i sin kategori. Skal virksomheden vælge mægler, er de en reel mulighed. Men de er ikke det eneste svar, og for nogle virksomheder passer en mindre, uafhængig specialist bedre. Her er en ærlig sammenligning.",
      },
      { type: "heading", level: 2, body: "Hvem er Söderberg & Partners?" },
      {
        type: "paragraph",
        body:
          "Söderberg & Partners er en nordisk rådgivningskoncern med en stor kundeportefølje inden for blandt andet firmapension, personforsikring og employee benefits. Størrelsen giver bred kapacitet og et solidt setup — særligt for virksomheder, der ønsker en samlet leverandør på tværs af pension og forsikring.",
      },
      { type: "heading", level: 2, body: "Hvad kendetegner Nordan Risk Partners?" },
      {
        type: "paragraph",
        body:
          "Nordan Risk Partners er et uafhængigt dansk mæglerhus med fokus på erhvervsforsikring og over 40 års samlet brancheerfaring. Vi er bevidst holdt i et format, hvor kunden taler direkte med den erfarne rådgiver, der kender sagen — uden telefonsluser og skiftende sagsbehandlere.",
      },
      { type: "heading", level: 2, body: "Sådan adskiller modellerne sig" },
      {
        type: "list",
        items: [
          "Størrelse: en stor koncern med bred kapacitet over for et fokuseret, uafhængigt hus",
          "Kontakt: teams og sagsbehandling over for én fast, erfaren rådgiver",
          "Tyngdepunkt: stærk på pension og employee benefits over for specialiseret erhvervsforsikring",
          "Beslutningsvej: koncernstruktur over for korte, danske beslutningsveje",
        ],
      },
      {
        type: "callout",
        eyebrow: "Vi trækker ingen ned",
        title: "Det handler om, hvad der passer til jer",
        body:
          "Begge modeller kan levere stærk rådgivning. Spørgsmålet er ikke, hvem der er bedst i al almindelighed — men hvilken model der passer til jeres virksomhed, risici og måde at arbejde på.",
      },
      { type: "heading", level: 2, body: "Hvornår giver en stor koncern god mening?" },
      {
        type: "paragraph",
        body:
          "Ønsker I én leverandør, der samler pension, sundhed og forsikring i ét setup, og vægter I bred koncernkapacitet højt, er en aktør af Söderberg & Partners' størrelse et naturligt valg.",
      },
      { type: "heading", level: 2, body: "Hvornår er Nordan et stærkt alternativ?" },
      {
        type: "list",
        items: [
          "I vil tale direkte med en erfaren rådgiver — ikke et skiftende team",
          "Erhvervsforsikringen har specialrisici, der kræver dybde frem for bredde",
          "I vil have en uvildig second opinion på et eksisterende program",
          "I sætter pris på korte beslutningsveje og et dansk, personligt setup",
        ],
      },
      {
        type: "paragraph",
        body:
          "Er I nysgerrige på, hvordan jeres nuværende program står, giver vi gerne en uforpligtende second opinion. Så har I et uvildigt sammenligningsgrundlag — uanset hvilken mægler I ender med at vælge.",
      },
    ],
  },

  // ── ALTERNATIV ───────────────────────────────────────────────────────
  {
    slug: "alternativ-til-willis-towers-watson",
    title: "Alternativ til Willis Towers Watson (WTW): dansk, uafhængig og tæt på",
    deck:
      "WTW er en global broking-gigant. For mange danske virksomheder er en uafhængig, lokal mægler dog et stærkere match. Her er forskellen — fair og uden at trække nogen ned.",
    metaDescription:
      "Alternativ til Willis Towers Watson (WTW)? Nordan Risk Partners er en uafhængig dansk erhvervsmægler med direkte adgang til erfarne rådgivere. Se hvornår global skala eller lokal nærhed passer bedst.",
    category: "alternativ",
    keywords: [
      "alternativ til Willis Towers Watson",
      "alternativ til WTW",
      "Willis forsikringsmægler Danmark",
      "uafhængig forsikringsmægler erhverv",
      "dansk forsikringsmægler",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "Willis Towers Watson", "WTW", "erhvervsforsikring"],
    aboutTopics: ["Forsikringsmægler", "Erhvervsforsikring", "Uvildig rådgivning"],
    heroImage: "/images/copenhagen.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-07-04",
    readingTime: "5 min",
    cvrLabel: "Få en uforpligtende second opinion på jeres program",
    relatedLinks: [
      { label: "Om Nordan Risk Partners", href: "/om-os" },
      { label: "Hvorfor bruge en forsikringsmægler?", href: "/hvorfor-forsikringsmaegler" },
      { label: "Se alle erhvervsforsikringer", href: "/erhvervsforsikringer" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Willis Towers Watson (WTW) er en af verdens største broking- og rådgivningsvirksomheder med global rækkevidde. For store, internationale koncerner er det en oplagt styrke. Men ikke alle danske virksomheder har brug for et globalt maskineri — nogle har brug for en rådgiver, der er tæt på. Her er en fair sammenligning.",
      },
      { type: "heading", level: 2, body: "Hvem er WTW?" },
      {
        type: "paragraph",
        body:
          "WTW er en international storaktør inden for forsikringsmægling, risikorådgivning og employee benefits. Den globale tilstedeværelse er en reel fordel for multinationale programmer, der skal koordineres på tværs af mange lande og store, komplekse risici.",
      },
      { type: "heading", level: 2, body: "Hvad kendetegner Nordan Risk Partners?" },
      {
        type: "paragraph",
        body:
          "Nordan Risk Partners er et uafhængigt dansk mæglerhus med speciale i erhvervsforsikring. Vi kender det danske marked og de danske selskaber indefra, og vi giver kunden direkte adgang til den erfarne rådgiver — ikke til en global supportfunktion.",
      },
      { type: "heading", level: 2, body: "Sådan adskiller modellerne sig" },
      {
        type: "list",
        items: [
          "Rækkevidde: globalt netværk over for dybt kendskab til det danske marked",
          "Ideel kunde: multinationale koncerner over for danske SMV'er og mid-market",
          "Kontakt: internationale teams over for én fast dansk rådgiver",
          "Nærhed: standardiserede globale processer over for korte, personlige beslutningsveje",
        ],
      },
      {
        type: "callout",
        eyebrow: "Vi trækker ingen ned",
        title: "Global skala og lokal nærhed løser to forskellige opgaver",
        body:
          "WTW er stærk, hvor opgaven er global og kompleks. Nordan er stærk, hvor den er dansk, specialiseret og relationsdrevet. Det handler om at matche behovet.",
      },
      { type: "heading", level: 2, body: "Hvornår giver WTW god mening?" },
      {
        type: "paragraph",
        body:
          "Har virksomheden aktiviteter i mange lande, komplekse globale programmer eller behov for at koordinere forsikring på tværs af koncernen internationalt, er en global aktør som WTW et naturligt valg.",
      },
      { type: "heading", level: 2, body: "Hvornår er Nordan et stærkt alternativ?" },
      {
        type: "list",
        items: [
          "Virksomheden har hovedsagelig danske aktiviteter og risici",
          "I vil have direkte adgang til en erfaren rådgiver, der kender jer",
          "I ønsker specialdybde inden for konkrete danske dækninger",
          "I vil have en uvildig second opinion på et eksisterende program",
        ],
      },
      {
        type: "paragraph",
        body:
          "Vil I vide, om jeres nuværende program er markedskonformt, tager vi gerne en uforpligtende gennemgang. Så har I et uvildigt grundlag at træffe beslutningen på.",
      },
    ],
  },

  // ── ALTERNATIV ───────────────────────────────────────────────────────
  {
    slug: "alternativ-til-aon",
    title: "Alternativ til Aon: uafhængig dansk mægler med senior-rådgivning",
    deck:
      "Aon er en global broking-virksomhed bygget til store, komplekse programmer. For mange danske virksomheder er en uafhængig specialist et bedre match. Her er den ærlige forskel.",
    metaDescription:
      "Alternativ til Aon? Nordan Risk Partners er en uafhængig dansk forsikringsmægler med direkte adgang til erfarne rådgivere. Se hvornår global skala eller dansk nærhed passer bedst.",
    category: "alternativ",
    keywords: [
      "alternativ til Aon",
      "Aon forsikringsmægler Danmark",
      "uafhængig forsikringsmægler erhverv",
      "dansk forsikringsmægler",
      "forsikringsmægler alternativ",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "Aon", "erhvervsforsikring", "alternativ"],
    aboutTopics: ["Forsikringsmægler", "Erhvervsforsikring", "Uvildig rådgivning"],
    heroImage: "/images/unsplash-partnership.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-07-06",
    readingTime: "5 min",
    cvrLabel: "Få en uforpligtende second opinion på jeres program",
    relatedLinks: [
      { label: "Om Nordan Risk Partners", href: "/om-os" },
      { label: "Sådan arbejder vi", href: "/saadan-arbejder-vi" },
      { label: "Se alle erhvervsforsikringer", href: "/erhvervsforsikringer" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Aon er blandt verdens største forsikringsmæglere og risikorådgivere. For multinationale virksomheder med tunge, globale programmer er det en betydelig styrke. Men størrelse er ikke altid det, en dansk virksomhed har mest brug for. Her sammenligner vi de to modeller — fair og respektfuldt.",
      },
      { type: "heading", level: 2, body: "Hvem er Aon?" },
      {
        type: "paragraph",
        body:
          "Aon er en global professionel servicevirksomhed inden for risiko, forsikringsmægling og pension. Den internationale kapacitet og data-tyngde er en reel fordel, når opgaven er stor, grænseoverskridende og kompleks.",
      },
      { type: "heading", level: 2, body: "Hvad kendetegner Nordan Risk Partners?" },
      {
        type: "paragraph",
        body:
          "Nordan Risk Partners er et uafhængigt dansk mæglerhus, hvor kunden taler direkte med en erfaren rådgiver med indgående kendskab til det danske marked. Vi er specialiseret i erhvervsforsikring og bygget til nærhed frem for skala.",
      },
      { type: "heading", level: 2, body: "Sådan adskiller modellerne sig" },
      {
        type: "list",
        items: [
          "Skala: globalt apparat over for fokuseret dansk specialisthus",
          "Ideel kunde: multinationale koncerner over for danske SMV'er og mid-market",
          "Kontakt: internationale teams over for én fast, erfaren rådgiver",
          "Tilgang: standardiserede globale processer over for skræddersyet dansk rådgivning",
        ],
      },
      {
        type: "callout",
        eyebrow: "Vi trækker ingen ned",
        title: "Vælg efter opgaven — ikke efter logoet",
        body:
          "Aon er stærk, hvor opgaven er global og kompleks. Nordan er stærk, hvor den er dansk, specialiseret og relationsdrevet. Begge kan være det rigtige valg — det afhænger af jer.",
      },
      { type: "heading", level: 2, body: "Hvornår giver Aon god mening?" },
      {
        type: "paragraph",
        body:
          "Har virksomheden international tilstedeværelse, meget store risici eller behov for global koordinering og avanceret risikoanalyse, er en aktør af Aons størrelse et logisk valg.",
      },
      { type: "heading", level: 2, body: "Hvornår er Nordan et stærkt alternativ?" },
      {
        type: "list",
        items: [
          "Virksomheden er primært dansk forankret",
          "I vil have direkte, personlig adgang til jeres rådgiver",
          "I ønsker specialdybde frem for global bredde",
          "I vil have en uvildig second opinion, før I fornyer eller skifter",
        ],
      },
      {
        type: "paragraph",
        body:
          "Er I i tvivl om, hvor jeres program står, gennemgår vi det gerne uforpligtende. Så ved I, om der er huller, dobbeltdækning eller bedre vilkår at hente.",
      },
    ],
  },

  // ── ALTERNATIV ───────────────────────────────────────────────────────
  {
    slug: "alternativ-til-marsh",
    title: "Alternativ til Marsh: uafhængig dansk mægler tæt på beslutningerne",
    deck:
      "Marsh er verdens største forsikringsmægler. For danske virksomheder, der vil have nærhed og senior-rådgivning, kan et uafhængigt hus dog være et stærkere match. Her er forskellen.",
    metaDescription:
      "Alternativ til Marsh? Nordan Risk Partners er en uafhængig dansk erhvervsmægler med direkte adgang til erfarne rådgivere. Se hvornår global skala eller dansk nærhed passer bedst.",
    category: "alternativ",
    keywords: [
      "alternativ til Marsh",
      "Marsh forsikringsmægler Danmark",
      "uafhængig forsikringsmægler erhverv",
      "dansk forsikringsmægler",
      "forsikringsmægler alternativ",
      "Nordan Risk Partners",
    ],
    ogTags: ["forsikringsmægler", "Marsh", "erhvervsforsikring", "alternativ"],
    aboutTopics: ["Forsikringsmægler", "Erhvervsforsikring", "Uvildig rådgivning"],
    heroImage: "/images/nordan-56.jpg",
    author: "Mads Horvits, Nordan Risk Partners",
    publishedAt: "2026-07-07",
    readingTime: "5 min",
    cvrLabel: "Få en uforpligtende second opinion på jeres program",
    relatedLinks: [
      { label: "Om Nordan Risk Partners", href: "/om-os" },
      { label: "Hvorfor bruge en forsikringsmægler?", href: "/hvorfor-forsikringsmaegler" },
      { label: "Se alle erhvervsforsikringer", href: "/erhvervsforsikringer" },
    ],
    body: [
      {
        type: "lead",
        body:
          "Marsh er verdens største forsikringsmægler og en tungvægter i global risikorådgivning. For multinationale koncerner er den skala en klar fordel. Men mange danske virksomheder søger noget andet: en rådgiver, der er tæt på, og som de kan få fat i direkte. Her er en fair sammenligning.",
      },
      { type: "heading", level: 2, body: "Hvem er Marsh?" },
      {
        type: "paragraph",
        body:
          "Marsh er en global broking-virksomhed med enorm international rækkevidde og dyb kapacitet inden for komplekse, grænseoverskridende programmer. Er opgaven stor og global, er det en betydelig styrke.",
      },
      { type: "heading", level: 2, body: "Hvad kendetegner Nordan Risk Partners?" },
      {
        type: "paragraph",
        body:
          "Nordan Risk Partners er et uafhængigt dansk mæglerhus med speciale i erhvervsforsikring og over 40 års samlet brancheerfaring. Vi giver kunden direkte adgang til den erfarne rådgiver — og korte beslutningsveje, fordi vi bevidst er holdt i et personligt format.",
      },
      { type: "heading", level: 2, body: "Sådan adskiller modellerne sig" },
      {
        type: "list",
        items: [
          "Rækkevidde: verdensomspændende apparat over for fokuseret dansk specialisthus",
          "Ideel kunde: multinationale koncerner over for danske SMV'er og mid-market",
          "Kontakt: store internationale teams over for én fast, erfaren rådgiver",
          "Nærhed: globale standardprocesser over for personlige, danske beslutningsveje",
        ],
      },
      {
        type: "callout",
        eyebrow: "Vi trækker ingen ned",
        title: "Skala og nærhed er to forskellige styrker",
        body:
          "Marsh excellerer på det globale og komplekse. Nordan excellerer på det danske, specialiserede og relationsdrevne. Det rigtige valg afhænger af, hvad jeres virksomhed har brug for.",
      },
      { type: "heading", level: 2, body: "Hvornår giver Marsh god mening?" },
      {
        type: "paragraph",
        body:
          "Har virksomheden global tilstedeværelse, meget store eller komplekse risici og behov for international koordinering, er en aktør af Marshs størrelse et naturligt valg.",
      },
      { type: "heading", level: 2, body: "Hvornår er Nordan et stærkt alternativ?" },
      {
        type: "list",
        items: [
          "Virksomheden er primært dansk forankret",
          "I vil tale direkte med en erfaren rådgiver, der kender jeres forretning",
          "I ønsker specialdybde frem for global bredde",
          "I vil have en uvildig second opinion, før I fornyer eller skifter",
        ],
      },
      {
        type: "paragraph",
        body:
          "Vil I vide, hvordan jeres program står i forhold til markedet, tager vi gerne en uforpligtende gennemgang. Så har I et uvildigt grundlag — uanset hvilken mægler I vælger.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getAllArticleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}
