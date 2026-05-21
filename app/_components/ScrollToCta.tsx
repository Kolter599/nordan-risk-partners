"use client";

/**
 * Scroll-to-element CTA. Used on product pages where every button should
 * lead users to the on-page form rather than navigating away.
 *
 * After scrolling, focuses the first <input> inside the target so the user
 * can start typing immediately.
 */
import type { ReactNode } from "react";

export function ScrollToCta({
  targetId,
  label,
  children,
  className,
  block = "center",
}: {
  targetId: string;
  label?: string;
  children?: ReactNode;
  className?: string;
  block?: ScrollLogicalPosition;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        const el = document.getElementById(targetId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block });
        setTimeout(() => {
          const input = el.querySelector("input");
          if (input instanceof HTMLInputElement) {
            input.focus({ preventScroll: true });
          }
        }, 600);
      }}
      className={className}
    >
      {children ?? label}
    </button>
  );
}
