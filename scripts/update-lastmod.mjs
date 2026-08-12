#!/usr/bin/env node
/**
 * Skriver lib/lastmod.ts ud fra git-historikken.
 *
 *   npm run lastmod              # skriv de nye datoer
 *   npm run lastmod -- --check   # vis kun hvad der ville ændre sig (exit 1)
 *
 * Datoerne committes med i repoet. Det er med vilje: Vercel kloner kun de
 * seneste commits, så `git blame` kan ikke køre under build. Og fordi de står
 * stille i filen, bliver de kun ændret når nogen faktisk retter indhold —
 * et deploy alene rykker ingenting.
 *
 * Glemmer du at køre kommandoen, sker der ingen skade: datoen bliver stående
 * på den forrige. Det er den rigtige vej at fejle.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  dirtyFiles,
  entryDates,
  newest,
  newestCommitDate,
  ownDirectoryFiles,
  today,
} from "./lastmod/resolve.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: path.dirname(fileURLToPath(import.meta.url)),
  encoding: "utf8",
}).trim();

const OUTPUT = "lib/lastmod.ts";

/**
 * Statiske ruter → deres egen app-mappe.
 *
 * Kun mappens egne filer tæller. Delte ting (app/_components/, app/layout.tsx,
 * lib/seo.ts) er bevidst udeladt: retter du navigationen eller en farve, har
 * undersiden ikke ændret indhold, og så skal Google ikke have besked.
 */
const STATIC_ROUTES = {
  "/": "app",
  "/analyse": "app/analyse",
  "/om-os": "app/om-os",
  "/hvorfor-forsikringsmaegler": "app/hvorfor-forsikringsmaegler",
  "/saadan-arbejder-vi": "app/saadan-arbejder-vi",
  "/kontakt-os": "app/kontakt-os",
  "/job": "app/job",
  "/tilbud/hole-in-one": "app/tilbud/hole-in-one",
};

/** Hub-sider: egen mappe eller nyeste barn — det nyeste af de to vinder. */
const HUB_ROUTES = {
  "/erhvervsforsikringer": { dir: "app/erhvervsforsikringer", childPrefix: "/erhvervsforsikringer/" },
  "/artikler": { dir: "app/artikler", childPrefix: "/artikler/" },
};

/**
 * "/" er et særtilfælde: app/ indeholder også layout.tsx, sitemap.ts, robots.ts
 * og not-found.tsx, som ikke er forsidens indhold.
 */
const ROOT_ONLY_FILES = ["app/page.tsx"];

function resolveAll() {
  const dirty = dirtyFiles(repoRoot);
  const routes = {};
  const warnings = [];

  const markIfDirty = (route, files) => {
    const touched = files.filter((f) => dirty.has(f));
    if (touched.length === 0) return false;
    warnings.push(`${route} — ikke-committede ændringer i ${touched.join(", ")}`);
    return true;
  };

  // 1. Statiske sider
  for (const [route, dir] of Object.entries(STATIC_ROUTES)) {
    const files = route === "/" ? ROOT_ONLY_FILES : ownDirectoryFiles(repoRoot, dir);
    routes[route] = markIfDirty(route, files) ? today() : newestCommitDate(repoRoot, files);
  }

  // 2. Produktsider — pr. entry, så én rettelse kun rykker én side
  const products = entryDates(repoRoot, "lib/insurance-products.ts", "export const INSURANCE_PRODUCTS");
  for (const [slug, { date, uncommitted }] of products) {
    routes[`/erhvervsforsikringer/${slug}`] = date;
    if (uncommitted) warnings.push(`/erhvervsforsikringer/${slug} — ikke-committet ændring`);
  }

  // 3. Artikler — aldrig tidligere end publishedAt
  const articles = entryDates(repoRoot, "lib/articles.ts", "export const ARTICLES");
  const published = publishedDates();
  for (const [slug, { date, uncommitted }] of articles) {
    routes[`/artikler/${slug}`] = newest(date, published.get(slug));
    if (uncommitted) warnings.push(`/artikler/${slug} — ikke-committet ændring`);
  }

  // 4. Hub-sider — egen mappe eller nyeste barn
  for (const [route, { dir, childPrefix }] of Object.entries(HUB_ROUTES)) {
    const files = ownDirectoryFiles(repoRoot, dir);
    const own = markIfDirty(route, files) ? today() : newestCommitDate(repoRoot, files);
    const children = Object.entries(routes)
      .filter(([r]) => r.startsWith(childPrefix))
      .map(([, d]) => d);
    routes[route] = newest(own, ...children);
  }

  return { routes, warnings };
}

/** publishedAt pr. artikel — gulvet under artiklernes lastmod. */
function publishedDates() {
  const source = readFileSync(path.join(repoRoot, "lib/articles.ts"), "utf8");
  const map = new Map();
  let slug = null;
  for (const line of source.split("\n")) {
    const s = line.match(/^\s*slug:\s*"([^"]+)"/);
    if (s) slug = s[1];
    const p = line.match(/^\s*publishedAt:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (p && slug) map.set(slug, p[1]);
  }
  return map;
}

function render(routes) {
  const sorted = Object.keys(routes).sort();
  const body = sorted
    .map((route) => `  ${JSON.stringify(route)}: ${JSON.stringify(routes[route])},`)
    .join("\n");

  return `/**
 * GENERERET FIL — ret den ikke i hånden.
 *
 * Kør \`npm run lastmod\` når du har committet ændringer til en side, så
 * aflæses de rigtige datoer fra git-historikken. \`npm run lastmod -- --check\`
 * viser hvad der ville ændre sig uden at skrive.
 *
 * Datoerne står her frem for at blive beregnet under build, fordi Vercel kun
 * kloner de seneste commits — og fordi et deploy uden indholdsændringer ikke
 * skal rykke en eneste dato. Det er dét der gør signalet troværdigt over for
 * Google.
 *
 * En rute uden dato her får slet ingen <lastmod> i sitemap'et. Ingen oplysning
 * er bedre end en forkert.
 */

export const LASTMOD: Record<string, string> = {
${body}
};
`;
}

const check = process.argv.includes("--check");
const { routes, warnings } = resolveAll();

const missing = Object.entries(routes).filter(([, d]) => !d);
if (missing.length > 0) {
  console.warn(`\n⚠  ${missing.length} rute(r) uden dato — de udelades af sitemap'et:`);
  for (const [route] of missing) console.warn(`   ${route}`);
}

if (warnings.length > 0) {
  console.warn(`\n⚠  Ikke-committede ændringer — datoen sættes til i dag (${today()}):`);
  for (const w of warnings) console.warn(`   ${w}`);
  console.warn("   Kør kommandoen igen efter commit for den præcise dato.\n");
}

const withDates = Object.fromEntries(Object.entries(routes).filter(([, d]) => d));
const next = render(withDates);
const outPath = path.join(repoRoot, OUTPUT);
const current = (() => {
  try {
    return readFileSync(outPath, "utf8");
  } catch {
    return null;
  }
})();

if (current === next) {
  console.log(`✓ ${OUTPUT} er allerede opdateret (${Object.keys(withDates).length} ruter).`);
  process.exit(0);
}

// Vis hvad der rent faktisk flytter sig — ikke bare "filen er ændret".
const before = current ? parseExisting(current) : {};
const changes = [];
for (const route of new Set([...Object.keys(before), ...Object.keys(withDates)])) {
  if (before[route] !== withDates[route]) {
    changes.push(`  ${route}: ${before[route] ?? "(ingen)"} → ${withDates[route] ?? "(ingen)"}`);
  }
}
console.log(`\n${changes.length} rute(r) ændrer dato:`);
console.log(changes.sort().join("\n"));

function parseExisting(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*"([^"]+)":\s*"([^"]+)",$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

if (check) {
  console.log(`\n(--check: skrev ikke. Kør \`npm run lastmod\` for at opdatere ${OUTPUT}.)`);
  process.exit(1);
}

writeFileSync(outPath, next);
console.log(`\n✓ Skrev ${OUTPUT} (${Object.keys(withDates).length} ruter).`);
