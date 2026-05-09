import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start din analyse — Nordan Risk Partners",
  robots: { index: false, follow: false },
};

/**
 * Layout for the focused sign-flow experience. No marketing chrome (Nav /
 * Footer / sticky CTA are filtered out by ConditionalChrome at the root).
 *
 * Body is locked to the viewport — no page-scroll, no double scroll
 * contexts. The card itself owns its scrolling needs internally.
 */
export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-ink)]">
      {children}
    </div>
  );
}
