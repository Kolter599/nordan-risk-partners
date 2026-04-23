import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    // Preserve SEO equity from the old flat URLs
    return [
      { source: "/arbejdsskadeforsikring", destination: "/erhvervsforsikringer/arbejdsskadeforsikring", permanent: true },
      { source: "/erhvervs-og-produktansvarsforsikring", destination: "/erhvervsforsikringer/erhvervs-og-produktansvarsforsikring", permanent: true },
      { source: "/fredede-ejendomme-forsikring", destination: "/erhvervsforsikringer/fredede-ejendomme-forsikring", permanent: true },
      { source: "/hole-in-one-forsikring", destination: "/erhvervsforsikringer/hole-in-one-forsikring", permanent: true },
      { source: "/forsikring-andelsboligforening-ejerforening", destination: "/erhvervsforsikringer/forsikring-andelsboligforening-ejerforening", permanent: true },
    ];
  },
};

export default nextConfig;
