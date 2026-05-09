"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-98Y5SSSM7H";
const CONSENT_KEY = "nrp.cookies.consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    nrpAnalyticsReady?: boolean;
  }
}

/**
 * Loads the GA4 tag only after the visitor has accepted cookies.
 * Re-checks consent whenever the tab regains focus so clicking
 * "accept" from the banner activates tracking without requiring a reload.
 */
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setConsented(localStorage.getItem(CONSENT_KEY) === "accepted");
      } catch {
        // noop
      }
    };
    check();
    window.addEventListener("focus", check);
    window.addEventListener("storage", check);
    // Custom event fired by CookieBanner on accept/decline
    window.addEventListener("nrp:consent-changed" as "storage", check);
    return () => {
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", check);
      window.removeEventListener("nrp:consent-changed" as "storage", check);
    };
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
          window.nrpAnalyticsReady = true;
        `}
      </Script>
    </>
  );
}

const SESSION_KEY = "nrp.track.session";

/**
 * Returns a stable per-browser session id (UUID v4-ish). Generated once and
 * persisted to localStorage so the same browser keeps the same id across
 * page loads. Falls back to in-memory if storage isn't available.
 */
let memoryClientId: string | null = null;
function getClientId(): string {
  if (memoryClientId) return memoryClientId;
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      memoryClientId = existing;
      return existing;
    }
    const fresh = generateUuid();
    localStorage.setItem(SESSION_KEY, fresh);
    memoryClientId = fresh;
    return fresh;
  } catch {
    if (!memoryClientId) memoryClientId = generateUuid();
    return memoryClientId;
  }
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers — not RFC4122 strict but unique enough.
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * track(eventName, params?) — safe helper.
 * 1) Pushes to dataLayer + GA4 (if consented).
 * 2) Posts to /api/track so the server can persist into Neon for the admin
 *    funnel — fire-and-forget, never blocks the UI, never throws.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", event, params]);
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  try {
    const clientId = getClientId();
    const path = window.location.pathname;
    const body = JSON.stringify({ clientId, event, params, path });
    // navigator.sendBeacon is reliable across page-unload (e.g. submit + navigate).
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Tracking failures must never surface to the user.
    });
  } catch {
    // ignore
  }
}
