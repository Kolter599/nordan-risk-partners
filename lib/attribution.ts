/**
 * Lead-attribution capture.
 *
 * On every page load we read UTM params + document.referrer + landing
 * pathname, then:
 *   • Save as **last-touch** (overwritten each visit) — useful when
 *     someone bounces between channels before converting.
 *   • Save as **first-touch** ONLY if no first-touch already exists —
 *     this is the durable record: where did they originally find us,
 *     even if they sign weeks later.
 *
 * Both stored in localStorage. First-touch never expires from this side;
 * users have to clear browser storage to lose it.
 */

const FIRST_KEY = "nrp.attr.first";
const LAST_KEY = "nrp.attr.last";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
type UtmKey = (typeof UTM_PARAMS)[number];

export type Attribution = {
  source: string | null; // utm_source
  medium: string | null; // utm_medium
  campaign: string | null; // utm_campaign
  content: string | null; // utm_content
  term: string | null; // utm_term
  /** Bare hostname of document.referrer when present — keeps PII out of
   * the path while preserving the channel (e.g. "linkedin.com"). */
  referrer: string | null;
  /** Landing pathname (e.g. "/", "/erhvervsforsikringer/cyberforsikring"). */
  landingPath: string | null;
  /** ISO timestamp the touch was captured. */
  capturedAt: string;
};

function safeReadJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — storage may be full or disabled (private mode in some browsers)
  }
}

function pickStringOrNull(v: string | null | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, 200);
}

function readUtmsFromUrl(url: URL): Record<UtmKey, string | null> {
  const out = {} as Record<UtmKey, string | null>;
  for (const k of UTM_PARAMS) {
    out[k] = pickStringOrNull(url.searchParams.get(k));
  }
  return out;
}

function referrerHostname(): string | null {
  if (typeof document === "undefined") return null;
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const u = new URL(ref);
    // Same-origin referrers aren't useful for channel attribution.
    if (u.hostname === window.location.hostname) return null;
    return u.hostname;
  } catch {
    return null;
  }
}

/**
 * Build the current touch from URL + document.referrer + path.
 * Returns null only if there's nothing worth recording (no UTMs and no
 * external referrer — e.g. user typed the URL by hand on a page they've
 * already been to).
 */
function buildCurrentTouch(): Attribution | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const utms = readUtmsFromUrl(url);
  const referrer = referrerHostname();
  const hasSignal =
    Object.values(utms).some((v) => v !== null) || referrer !== null;
  if (!hasSignal) return null;
  return {
    source: utms.utm_source,
    medium: utms.utm_medium,
    campaign: utms.utm_campaign,
    content: utms.utm_content,
    term: utms.utm_term,
    referrer,
    landingPath: url.pathname,
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Call once per page load (e.g. from GoogleAnalytics component on mount).
 * Updates last-touch always; sets first-touch only if absent.
 */
export function captureAttribution(): {
  first: Attribution | null;
  last: Attribution | null;
} {
  const current = buildCurrentTouch();

  // Always update last-touch when there's a signal
  if (current) {
    safeWriteJson(LAST_KEY, current);
  }

  // First-touch is sticky — only set if missing
  const existingFirst = safeReadJson<Attribution>(FIRST_KEY);
  if (!existingFirst) {
    // Even if no UTM/referrer signal on landing, save the path so we can
    // tell "they came in cold via /" vs "via /erhvervsforsikringer/…".
    const fallback: Attribution =
      current ??
      {
        source: null,
        medium: null,
        campaign: null,
        content: null,
        term: null,
        referrer: null,
        landingPath:
          typeof window !== "undefined" ? window.location.pathname : null,
        capturedAt: new Date().toISOString(),
      };
    safeWriteJson(FIRST_KEY, fallback);
    return { first: fallback, last: current };
  }

  return { first: existingFirst, last: current };
}

export function getAttribution(): {
  first: Attribution | null;
  last: Attribution | null;
} {
  return {
    first: safeReadJson<Attribution>(FIRST_KEY),
    last: safeReadJson<Attribution>(LAST_KEY),
  };
}
