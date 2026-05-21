/**
 * Editorial article catalog. Each article renders through a shared
 * template at /artikler/[slug] and is included in the sitemap so Google
 * indexes them — but no nav element links to /artikler, keeping the
 * site visually focused while still capturing long-tail search traffic.
 */

export type ArticleSection =
  | { type: "paragraph"; body: string }
  | { type: "lead"; body: string }
  | { type: "heading"; level: 2 | 3; body: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; eyebrow?: string; title?: string; body: string };

export type Article = {
  slug: string;
  /** Document <title> + H1 candidate. */
  title: string;
  /** Subheadline shown under the H1 in the hero. */
  deck: string;
  /** SEO meta description (≤ 160 chars recommended). */
  metaDescription: string;
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
      "Præmiestigninger på 160% er ikke længere usædvanlige for fredede ejendomme. Læs hvorfor markedet er presset, og hvad ejere kan gøre.",
    heroImage: "/images/fredede-ejendomme-160-procent.jpg",
    author: "Mads Berg, Nordan Risk Partners",
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
];

export function getArticle(slug: string): Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getAllArticleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}
