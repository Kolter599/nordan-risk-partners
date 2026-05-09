"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { StickyMobileCta } from "./StickyMobileCta";

/**
 * Routes that own the entire viewport — no marketing chrome (Nav, Footer,
 * sticky CTA) should render. The focused sign flow at /start lives here:
 * when the user is signing a fuldmagt the only thing on screen is the
 * card itself.
 */
function isChromeFreeRoute(pathname: string): boolean {
  return pathname.startsWith("/start") || pathname.startsWith("/admin");
}

export function ConditionalNav() {
  const pathname = usePathname() ?? "";
  if (isChromeFreeRoute(pathname)) return null;
  return <Nav />;
}

export function ConditionalFooter() {
  const pathname = usePathname() ?? "";
  if (isChromeFreeRoute(pathname)) return null;
  return <Footer />;
}

export function ConditionalStickyCta() {
  const pathname = usePathname() ?? "";
  if (isChromeFreeRoute(pathname)) return null;
  return <StickyMobileCta />;
}
