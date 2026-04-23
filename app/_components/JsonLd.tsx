const ORG = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  name: "Nordan Risk Partners ApS",
  url: "https://nordan-risk-partners.vercel.app",
  logo: "https://nordan-risk-partners.vercel.app/images/logo.png",
  description:
    "Uafhængigt forsikringsmæglerhus med speciale i erhvervsforsikringer. Over 40 års brancheerfaring.",
  telephone: "+4553520006",
  email: "info@ndrp.dk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Toftevej 15B",
    postalCode: "3450",
    addressLocality: "Allerød",
    addressCountry: "DK",
  },
  taxID: "45953769",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:30",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:30",
      closes: "15:00",
    },
  ],
  sameAs: ["https://www.linkedin.com/company/nordan-risk-partners"],
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }}
    />
  );
}
