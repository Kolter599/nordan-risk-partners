/**
 * Udleder ægte lastmod-datoer fra git-historikken.
 *
 * Princippet: en side er "ændret" når dens *indhold* er ændret — ikke når
 * nogen har rettet en farve i en delt komponent. Derfor kigger vi kun på de
 * filer der udgør sidens indhold:
 *
 *   - statiske sider  → filerne i sidens egen app-mappe (page.tsx + evt.
 *                       co-lokerede komponenter). IKKE app/_components/,
 *                       lib/seo.ts eller layout.tsx — det er struktur.
 *   - produktsider    → den enkelte entry i lib/insurance-products.ts,
 *                       fundet med git blame pr. linjeinterval. Retter du én
 *                       produkttekst, rykker kun den ene side.
 *   - artikler        → den enkelte entry i lib/articles.ts, dog aldrig
 *                       tidligere end artiklens publishedAt.
 *   - hub-sider       → egen mappe ELLER nyeste barn, alt efter hvad der er
 *                       nyest. Listen ændrer sig når der kommer et barn til.
 *
 * Alt kører mod git, ikke mod filsystemets mtime — mtime er tilfældig efter
 * en clone og ville lyve på samme måde som `new Date()`.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

/** Datoerne skal læses som danske datoer, ikke UTC. */
const TZ = "Europe/Copenhagen";
const DATE_FMT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Unix-sekunder → "YYYY-MM-DD" i dansk tid. */
export function formatDate(unixSeconds) {
  return DATE_FMT.format(new Date(unixSeconds * 1000));
}

export function today() {
  return DATE_FMT.format(new Date());
}

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Filer med ikke-committede ændringer — deres datoer kan ikke stoles på. */
export function dirtyFiles(repoRoot) {
  const out = git(["status", "--porcelain", "--untracked-files=all"], repoRoot);
  const set = new Set();
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    // Formatet er "XY <sti>" — ved omdøbning "XY <gammel> -> <ny>".
    const file = line.slice(3).split(" -> ").pop().trim();
    if (file) set.add(file);
  }
  return set;
}

/**
 * Nyeste author-dato på tværs af en række filer. Author-dato frem for
 * committer-dato, fordi rebase skriver committer-datoen om.
 */
export function newestCommitDate(repoRoot, files) {
  if (files.length === 0) return null;
  const existing = files.filter((f) => existsSync(path.join(repoRoot, f)));
  if (existing.length === 0) return null;
  const out = git(["log", "-1", "--format=%at", "--", ...existing], repoRoot).trim();
  return out ? formatDate(Number(out)) : null;
}

/**
 * Deler et TS-array af objektliteraler op i linjeintervaller — ét pr. entry.
 *
 * Går tegn for tegn og tæller klammer, med styr på strenge, template literals
 * og kommentarer, så dansk brødtekst med { } eller apostroffer ikke vælter
 * optællingen. Returnerer [{ startLine, endLine }] (1-indekseret).
 */
export function entryRanges(source, arrayDeclaration) {
  const declIndex = source.indexOf(arrayDeclaration);
  if (declIndex === -1) {
    throw new Error(`Kunne ikke finde "${arrayDeclaration}" — er filen omdøbt?`);
  }
  // Find "= [" eller "= {" — ikke det første "[", ellers rammer vi
  // typeannotationen (`InsuranceProduct[]`) og ser en tom beholder.
  // Begge former forekommer: et array af objekter, eller et Record kect på slug.
  const assignment = /=\s*[[{]/.exec(source.slice(declIndex));
  if (!assignment) throw new Error(`Ingen "= [" eller "= {" efter ${arrayDeclaration}`);
  const openIndex = declIndex + assignment.index + assignment[0].length - 1;

  // Linjenummer for et vilkårligt offset.
  const lineStarts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") lineStarts.push(i + 1);
  }
  const lineOf = (offset) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const ranges = [];
  // depth 0 = direkte inde i beholderen. Et "{" på depth 0 starter en entry;
  // en lukkeklamme på depth 0 er beholderens egen og afslutter scanningen.
  let depth = 0;
  let entryStart = null;
  let mode = "code"; // code | line-comment | block-comment | " | ' | `

  for (let i = openIndex + 1; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (mode === "line-comment") {
      if (ch === "\n") mode = "code";
      continue;
    }
    if (mode === "block-comment") {
      if (ch === "*" && next === "/") {
        mode = "code";
        i++;
      }
      continue;
    }
    if (mode === '"' || mode === "'" || mode === "`") {
      if (ch === "\\") i++;
      else if (ch === mode) mode = "code";
      continue;
    }

    if (ch === "/" && next === "/") {
      mode = "line-comment";
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      mode = "block-comment";
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      mode = ch;
      continue;
    }

    if (ch === "{" || ch === "[") {
      if (depth === 0 && ch === "{") entryStart = i;
      depth++;
    } else if (ch === "}" || ch === "]") {
      if (depth === 0) break; // beholderens egen lukkeklamme — vi er færdige
      depth--;
      if (depth === 0 && entryStart !== null && ch === "}") {
        ranges.push({ startLine: lineOf(entryStart), endLine: lineOf(i) });
        entryStart = null;
      }
    }
  }

  return ranges;
}

/** Linjenummer → { time, committed } fra git blame. */
function blameLineTimes(repoRoot, file) {
  const out = git(["blame", "--line-porcelain", "--", file], repoRoot);
  const times = new Map();
  let currentLine = null;
  let currentCommitted = true;
  for (const line of out.split("\n")) {
    const header = line.match(/^([0-9a-f]{40}) \d+ (\d+)/);
    if (header) {
      currentLine = Number(header[2]);
      // Lutter nuller = linjen er ikke committet endnu.
      currentCommitted = !/^0{40}$/.test(header[1]);
      continue;
    }
    const at = line.match(/^author-time (\d+)/);
    if (at && currentLine !== null) {
      times.set(currentLine, { time: Number(at[1]), committed: currentCommitted });
    }
  }
  return times;
}

/**
 * Dato pr. entry i en datafil: nyeste commit der rørte entryens linjer.
 * Nøglen er entryens slug.
 *
 * Kaster hvis antallet af entries ikke matcher antallet af slugs — så hellere
 * en fejl end datoer der stille er forskudt én entry.
 */
export function entryDates(repoRoot, file, arrayDeclaration) {
  const source = readFileSync(path.join(repoRoot, file), "utf8");
  const lines = source.split("\n");
  const ranges = entryRanges(source, arrayDeclaration);
  const times = blameLineTimes(repoRoot, file);

  // En tom beholder betyder næsten altid at vi peger det forkerte sted hen.
  // Hellere en fejl end et sitemap der stille mister alle sine datoer.
  if (ranges.length === 0) {
    throw new Error(
      `${file}: fandt ingen entries under "${arrayDeclaration}". Er filen omskrevet?`
    );
  }

  const result = new Map();
  for (const { startLine, endLine } of ranges) {
    // Første slug i intervallet er entryens egen — indlejrede objekter
    // (fx relatedService: { slug }) står altid efter.
    let slug = null;
    for (let n = startLine; n <= endLine && !slug; n++) {
      const m = lines[n - 1]?.match(/\bslug:\s*"([^"]+)"/);
      if (m) slug = m[1];
    }
    if (!slug) {
      throw new Error(`Entry på linje ${startLine}-${endLine} i ${file} har ingen slug`);
    }
    // Invariant: slugs er unikke. To entries med samme slug betyder at
    // intervallerne er forskudt eller smeltet sammen — og så er datoerne
    // stille forkerte, hvilket er værre end ingen datoer.
    if (result.has(slug)) {
      throw new Error(
        `${file}: slug "${slug}" optræder i to entries (linje ${startLine}-${endLine}). ` +
          `Intervallerne er forskudt — ret parseren frem for at stole på datoerne.`
      );
    }

    let newest = 0;
    let uncommitted = false;
    for (let n = startLine; n <= endLine; n++) {
      const entry = times.get(n);
      if (!entry) continue;
      if (!entry.committed) uncommitted = true;
      else if (entry.time > newest) newest = entry.time;
    }
    // Ikke-committede linjer får bevidst IKKE dagens dato. En dato skal altid
    // være dækket af en commit — ellers kan en gammel, glemt ændring i
    // arbejdstræet stemple siden som ændret i dag. Vi advarer i stedet.
    result.set(slug, {
      date: newest ? formatDate(newest) : null,
      uncommitted,
    });
  }
  return result;
}

/**
 * Filnavne der aldrig er *indhold*: framework-stilladset omkring siden.
 * layout/error/loading er struktur, og sitemap/robots handler om siden set
 * udefra — ingen af dem betyder at teksten på siden er ændret.
 */
const INFRA_FILES = new Set([
  "layout.tsx",
  "layout.ts",
  "template.tsx",
  "loading.tsx",
  "error.tsx",
  "global-error.tsx",
  "not-found.tsx",
  "sitemap.ts",
  "robots.ts",
  "opengraph-image.tsx",
  "twitter-image.tsx",
  "icon.tsx",
  "apple-icon.tsx",
  "route.ts",
]);

/**
 * Finder alle statiske ruter under app-mappen ved at lede efter page.tsx.
 *
 * Route groups — (site) — og parallelle ruter (@slot) fjernes fra stien, sådan
 * som Next selv gør. Dynamiske ruter ([slug]) springes over: deres indhold bor
 * i en datafil, ikke i mappen, og håndteres for sig.
 *
 * Returnerer [{ route, dir, files }] hvor files er mappens egne indholdsfiler.
 */
export function discoverRoutes(repoRoot, appDir, ignore = []) {
  const found = [];

  const walk = (relDir) => {
    const abs = path.join(repoRoot, relDir);
    if (!existsSync(abs)) return;
    const entries = readdirSync(abs, { withFileTypes: true });

    const hasPage = entries.some((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name));
    if (hasPage) {
      const segments = path
        .relative(appDir, relDir)
        .split(path.sep)
        .filter((s) => s && s !== ".")
        // Route groups og parallelle ruter indgår ikke i URL'en.
        .filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith("@"));

      const isDynamic = segments.some((s) => s.startsWith("["));
      if (!isDynamic) {
        const route = "/" + segments.join("/");
        const normalized = route === "/" ? "/" : route.replace(/\/$/, "");
        if (!ignore.some((re) => re.test(normalized))) {
          found.push({
            route: normalized,
            dir: relDir,
            files: entries
              .filter(
                (e) =>
                  e.isFile() && /\.(tsx|ts)$/.test(e.name) && !INFRA_FILES.has(e.name)
              )
              .map((e) => path.posix.join(relDir, e.name)),
          });
        }
      }
    }

    for (const e of entries) {
      if (e.isDirectory() && e.name !== "node_modules") {
        walk(path.posix.join(relDir, e.name));
      }
    }
  };

  walk(appDir);
  return found;
}

/** Filer der ligger direkte i en rutes egen mappe — ikke undermapper. */
export function ownDirectoryFiles(repoRoot, dir) {
  const abs = path.join(repoRoot, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(tsx|ts)$/.test(e.name))
    .map((e) => path.posix.join(dir, e.name));
}

/**
 * Indholdsfiler i en mappe — typisk markdown, hvor én fil svarer til én side.
 * Så er git-datoen på filen sidens dato, uden nogen omvej.
 */
export function contentFiles(repoRoot, dir, extensions = [".md", ".mdx"]) {
  const abs = path.join(repoRoot, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && extensions.some((ext) => e.name.endsWith(ext)))
    .map((e) => path.posix.join(dir, e.name))
    .sort();
}

/** Nyeste af to "YYYY-MM-DD"-strenge; null-tolerant. */
export function newest(...dates) {
  return dates.filter(Boolean).sort().pop() ?? null;
}
