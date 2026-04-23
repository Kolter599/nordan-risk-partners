import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Inter } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";
import { StickyMobileCta } from "./_components/StickyMobileCta";
import { CookieBanner } from "./_components/CookieBanner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const SITE_URL = "https://nordan-risk-partners.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nordan Risk Partners — Uafhængig forsikringsmægler til erhverv",
    template: "%s · Nordan Risk Partners",
  },
  description:
    "Uvildig rådgivning om erhvervsforsikring i Danmark. Med over 40 års brancheerfaring hjælper vi virksomheder med forsikringsprogrammer der matcher deres virkelighed — ingen bindinger, ingen telefonsluser.",
  keywords: [
    "forsikringsmægler",
    "erhvervsforsikring",
    "uafhængig forsikringsmægler",
    "uvildig rådgivning forsikring",
    "bestyrelsesansvarsforsikring",
    "arbejdsskadeforsikring",
    "cyberforsikring",
    "bygningsforsikring",
    "fredede ejendomme forsikring",
    "forsikringsmægler Danmark",
    "Nordan Risk Partners",
  ],
  authors: [{ name: "Nordan Risk Partners ApS" }],
  creator: "Nordan Risk Partners ApS",
  publisher: "Nordan Risk Partners ApS",
  formatDetection: { email: true, address: true, telephone: true },
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: SITE_URL,
    siteName: "Nordan Risk Partners",
    title: "Nordan Risk Partners — Uafhængig forsikringsmægler",
    description:
      "Uvildig rådgivning om erhvervsforsikring. Direkte adgang til erfarne rådgivere — ingen telefonsluser. Gratis analyse via CVR.",
    images: [{ url: "/images/nordan-75.jpg", width: 1200, height: 630, alt: "Nordan Risk Partners — uafhængig forsikringsmægler" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nordan Risk Partners — Uafhængig forsikringsmægler",
    description: "Uvildig rådgivning om erhvervsforsikring. Gratis analyse via CVR.",
    images: ["/images/nordan-75.jpg"],
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${montserrat.variable} ${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyMobileCta />
        <CookieBanner />
        <VercelAnalytics />
      </body>
    </html>
  );
}
