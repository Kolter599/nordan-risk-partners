export const SOURCE_LABELS: Record<string, string> = {
  kontakt: "Kontakt",
  hero: "Forside",
  analyse: "/analyse",
  hole_in_one: "Hole-in-one",
  sign: "Signering",
  frafald: "Frafald (uden fuldmagt)",
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Ny", color: "#6b6b6b" },
  partial: { label: "Halvfærdig", color: "#a58878" },
  completed: { label: "Færdig", color: "#253f32" },
  quoted: { label: "Tilbud sendt", color: "#1d4ed8" },
  won: { label: "Vundet", color: "#15803d" },
  lost: { label: "Tabt", color: "#b91c1c" },
};
