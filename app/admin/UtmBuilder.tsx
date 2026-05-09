"use client";

import { useMemo, useState } from "react";

const SITE = "https://nordanriskpartners.dk";

const PRESETS: { label: string; values: { source: string; medium: string } }[] = [
  { label: "LinkedIn — organic post", values: { source: "linkedin", medium: "organic-social" } },
  { label: "LinkedIn — paid", values: { source: "linkedin", medium: "paid-social" } },
  { label: "Mail-signatur", values: { source: "mail-signatur", medium: "email" } },
  { label: "Cold outreach mail", values: { source: "outreach", medium: "email" } },
  { label: "Newsletter", values: { source: "newsletter", medium: "email" } },
  { label: "Podcast / show notes", values: { source: "podcast", medium: "content" } },
  { label: "Visitkort / QR", values: { source: "visitkort", medium: "offline" } },
];

const PATHS = [
  { label: "Forside", value: "/" },
  { label: "Start analyse", value: "/start" },
  { label: "Hole-in-one", value: "/tilbud/hole-in-one" },
  { label: "Erhvervsforsikring", value: "/erhvervsforsikringer" },
  { label: "Hvorfor mægler?", value: "/hvorfor-forsikringsmaegler" },
  { label: "Om os", value: "/om-os" },
  { label: "Kontakt os", value: "/kontakt-os" },
];

/**
 * Generates a UTM-tagged URL for sharing on a specific channel. Optional —
 * the site captures referrer-based attribution automatically — but useful
 * when Mads wants to track a specific campaign (e.g. a one-off post).
 */
export function UtmBuilder() {
  const [path, setPath] = useState("/");
  const [source, setSource] = useState("linkedin");
  const [medium, setMedium] = useState("organic-social");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const u = new URL(`${SITE}${path}`);
    if (source) u.searchParams.set("utm_source", source.trim());
    if (medium) u.searchParams.set("utm_medium", medium.trim());
    if (campaign.trim()) u.searchParams.set("utm_campaign", campaign.trim());
    if (content.trim()) u.searchParams.set("utm_content", content.trim());
    return u.toString();
  }, [path, source, medium, campaign, content]);

  const ready = source.trim().length > 0 && medium.trim().length > 0;

  function applyPreset(p: (typeof PRESETS)[number]) {
    setSource(p.values.source);
    setMedium(p.values.medium);
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <section className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-5 mb-8">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-semibold text-[1rem]">UTM-link generator</h2>
        <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">Frivillig</span>
      </div>
      <p className="text-[0.78rem] text-[color:var(--color-nordan-muted)] leading-snug mb-4">
        Vil du tracke en specifik post, mail eller kampagne? Generer et tagget link her.
        Vælg en preset eller skriv selv.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-2.5 py-1 rounded-full text-[0.75rem] font-medium border border-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-accent)] hover:text-[color:var(--color-nordan-accent)] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <UtmField label="Side">
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] bg-white text-[0.92rem]"
          >
            {PATHS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.value})
              </option>
            ))}
          </select>
        </UtmField>
        <UtmField label="Source (hvor)">
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="linkedin, mail-signatur..."
            className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.92rem]"
          />
        </UtmField>
        <UtmField label="Medium (format)">
          <input
            type="text"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            placeholder="organic-social, email, content..."
            className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.92rem]"
          />
        </UtmField>
        <UtmField label="Kampagne (valgfrit)">
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="q2-bestyrelsesansvar"
            className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.92rem]"
          />
        </UtmField>
        <UtmField label="Content (valgfrit — variant af samme post)">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="hero-billede, bullet-version..."
            className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.92rem]"
          />
        </UtmField>
      </div>

      <div className="mt-4 p-3 rounded-[8px] bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)] flex items-center gap-3">
        <code className="flex-1 text-[0.78rem] break-all text-[color:var(--color-nordan-ink)] font-mono">
          {url}
        </code>
        <button
          type="button"
          onClick={copyUrl}
          disabled={!ready}
          className={`shrink-0 h-9 px-4 rounded-[6px] text-[0.82rem] font-semibold transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : ready
              ? "bg-[color:var(--color-nordan-dark)] text-white hover:bg-[color:var(--color-nordan-dark-deep)]"
              : "bg-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-muted)] cursor-not-allowed"
          }`}
        >
          {copied ? "✓ Kopieret" : "Kopier link"}
        </button>
      </div>
    </section>
  );
}

function UtmField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)] mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}
