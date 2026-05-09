/**
 * Tracks the most recent successful fuldmagt signing in localStorage.
 *
 * After a user finishes the /start flow we redirect them home, and the
 * homepage CVR card swaps from "indtast CVR" to a personalized "Tak,
 * vi er i gang"-state for the company they just signed for.
 */

const KEY = "nrp.recent_signed";

// How long the personalized state stays visible before reverting to the
// normal CVR-input. Long enough to feel natural after the redirect, short
// enough that it doesn't follow them around days later.
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export type RecentSigned = {
  signedAt: string; // ISO
  companyName: string;
  cvr: string;
  /** What flow they just finished. Lets the homepage card show different
   *  copy ("Vi er i gang med jeres analyse" vs "Tilbud på hole-in-one"). */
  kind?: "analyse" | "hole_in_one";
};

export function setRecentSigned(value: RecentSigned): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore — analytics-grade nice-to-have, not critical
  }
}

export function getRecentSigned(): RecentSigned | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecentSigned;
    if (!parsed.signedAt || !parsed.companyName) return null;
    if (Date.now() - new Date(parsed.signedAt).getTime() > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearRecentSigned(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
