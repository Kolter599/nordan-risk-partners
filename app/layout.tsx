import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Inter } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";
import { StickyMobileCta } from "./_components/StickyMobileCta";
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

const SITE_URL = "https://www.nordanriskpartners.dk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nordan Risk Partners — Uafhængige forsikringsmæglere",
    template: "%s · Nordan Risk Partners",
  },
  description:
    "Uvildig rådgivning indenfor erhvervsforsikring. Med over 40 års brancheerfaring hjælper vi danske virksomheder med forsikringsprogrammer der matcher deres virkelighed.",
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: SITE_URL,
    siteName: "Nordan Risk Partners",
    title: "Nordan Risk Partners — Uafhængige forsikringsmæglere",
    description:
      "Uvildig rådgivning indenfor erhvervsforsikring. Direkte adgang til erfarne rådgivere – ikke telefonsluser.",
    images: [{ url: "/images/logo.png", width: 1200, height: 630 }],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${montserrat.variable} ${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyMobileCta />
        <VercelAnalytics />
      </body>
    </html>
  );
}
