import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <nav aria-label="Breadcrumbs" className="mb-5">
      <ol className={`flex flex-wrap items-center gap-2 text-[0.78rem] tracking-[0.08em] font-medium ${isDark ? "text-white/70" : "text-[color:var(--color-nordan-muted)]"}`}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className={`hover:${isDark ? "text-white" : "text-[color:var(--color-nordan-accent)]"} transition-colors`}
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? (isDark ? "text-white" : "text-[color:var(--color-nordan-ink)]") : ""}>
                  {c.label}
                </span>
              )}
              {!last ? <span aria-hidden className="opacity-40">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
