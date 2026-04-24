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

/**
 * track(eventName, params?) — safe helper.
 * Pushes to dataLayer even if gtag hasn't loaded yet (e.g. pre-consent);
 * GA4 will consume the queue when it initializes.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", event, params]);
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}
